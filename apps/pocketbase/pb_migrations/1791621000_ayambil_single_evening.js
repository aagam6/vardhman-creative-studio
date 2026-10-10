migrate(app => {
  const bookings = app.findCollectionByNameOrId('ayambil_bookings');
  bookings.fields.add(new SelectField({ name: 'event_date', maxSelect: 1, values: ['2026-11-02', '2026-11-03'] }));
  bookings.fields.add(new BoolField({ name: 'whatsapp_consent' }));
  bookings.fields.add(new TextField({ name: 'consent_at' }));
  app.save(bookings);
  const rule = '@request.auth.collectionName = "ayambil_admins" && @request.auth.enabled = true';
  app.save(new Collection({ name: 'ayambil_messages', type: 'base', listRule: rule, viewRule: rule,
    createRule: null, updateRule: null, deleteRule: null,
    fields: [
      { name: 'booking', type: 'relation', required: true, maxSelect: 1, collectionId: bookings.id },
      { name: 'status', type: 'select', required: true, maxSelect: 1, values: ['queued','sending','accepted','delivered','read','failed','uncertain','cancelled'] },
      { name: 'provider_ref', type: 'text' }, { name: 'failure', type: 'text' },
      { name: 'provider_history', type: 'json' },
      { name: 'attempts', type: 'number' }, { name: 'attempted_at', type: 'text' },
      { name: 'accepted_at', type: 'text' }, { name: 'delivered_at', type: 'text' },
      { name: 'download_hash', type: 'text' }, { name: 'download_key', type: 'text', hidden: true },
      { name: 'download_expires', type: 'text' },
      { name: 'created', type: 'autodate', onCreate: true }, { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
    ], indexes: ['CREATE UNIQUE INDEX idx_ayambil_message_booking ON ayambil_messages (booking)', 'CREATE UNIQUE INDEX idx_ayambil_download_hash ON ayambil_messages (download_hash)']
  }));
}, () => { throw new Error('Rollback disabled to preserve registrations and message history.'); });
