// Service worker: recibe las notificaciones push aunque la app esté cerrada.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "AgendaLec", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "AgendaLec";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "agendalec",
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Al tocar la notificación, abre la app (o enfoca la que ya está abierta).
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (lista) => {
      for (const cliente of lista) {
        if ("focus" in cliente) {
          await cliente.focus();
          // WindowClient.navigate() no anda confiable en todos los
          // navegadores (Safari/iOS en particular lo ignora en silencio),
          // así que además se le avisa a la página por mensaje para que
          // ella misma cambie de pantalla sin depender de esa API.
          cliente.postMessage({ type: "agendalec-navigate", url: destino });
          if ("navigate" in cliente) {
            try { await cliente.navigate(destino); } catch (e) {}
          }
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(destino);
    })
  );
});
