// Additive only. Deploy alongside the updated registration validation hook.
migrate(app => {
  const bookings = app.findCollectionByNameOrId('ayambil_bookings');
  bookings.fields.add(new TextField({ name: 'terms_version' }));
  bookings.fields.add(new TextField({ name: 'terms_accepted_at' }));
  app.save(bookings);
}, () => { throw new Error('Rollback requires review; retain consent history.'); });
