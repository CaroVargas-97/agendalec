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
          // Enfocar la pestaña ya abierta no alcanza: si no se navega
          // también, la notificación te deja en la pantalla en la que
          // ya estabas en vez de llevarte al turno que la generó.
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
