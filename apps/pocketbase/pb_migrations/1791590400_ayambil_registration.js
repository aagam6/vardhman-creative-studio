// Additive migration. Existing collections and data are never modified.
migrate((app) => {
  const timestamps = () => [
    { name: 'created', type: 'autodate', onCreate: true },
    { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
  ];
  const adminRule = '@request.auth.collectionName = "ayambil_admins" && @request.auth.enabled = true';
  const admins = new Collection({ name: 'ayambil_admins', type: 'auth',
    listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
    authRule: 'enabled = true', passwordAuth: { enabled: true, identityFields: ['email'] },
    fields: [{ name: 'enabled', type: 'bool' }, ...timestamps()],
  });
  app.save(admins);
  const base = (name, fields, indexes) => {
    const collection = new Collection({ name, type: 'base', listRule: adminRule, viewRule: adminRule,
      createRule: null, updateRule: null, deleteRule: null, fields: [...fields, ...timestamps()], indexes: indexes || [] });
    app.save(collection); return collection;
  };
  const bookings = base('ayambil_bookings', [
    { name: 'number', type: 'text', required: true },
    { name: 'contact_name', type: 'text', required: true, max: 120 },
    { name: 'mobile', type: 'text', required: true, max: 16 },
    { name: 'request_hash', type: 'text', required: true },
    { name: 'payload_hash', type: 'text', required: true },
    { name: 'status', type: 'select', required: true, maxSelect: 1, values: ['active', 'cancelled'] },
  ], ['CREATE UNIQUE INDEX idx_ayambil_request ON ayambil_bookings (request_hash)', 'CREATE UNIQUE INDEX idx_ayambil_booking_number ON ayambil_bookings (number)']);
  const attendees = base('ayambil_attendees', [
    { name: 'booking', type: 'relation', required: true, maxSelect: 1, collectionId: bookings.id, cascadeDelete: false },
    { name: 'full_name', type: 'text', required: true, max: 120 },
    { name: 'dates', type: 'select', required: true, maxSelect: 2, values: ['2026-11-02', '2026-11-03'] },
    { name: 'status', type: 'select', required: true, maxSelect: 1, values: ['active', 'cancelled'] },
  ]);
  base('ayambil_passes', [
    { name: 'attendee', type: 'relation', required: true, maxSelect: 1, collectionId: attendees.id, cascadeDelete: false },
    { name: 'number', type: 'text', required: true },
    { name: 'snapshot', type: 'json', required: true },
    { name: 'status', type: 'select', required: true, maxSelect: 1, values: ['active', 'cancelled', 'superseded'] },
  ], ['CREATE UNIQUE INDEX idx_ayambil_pass_number ON ayambil_passes (number)', "CREATE UNIQUE INDEX idx_ayambil_active_pass ON ayambil_passes (attendee) WHERE status = 'active'"]);
  base('ayambil_audit', [
    { name: 'actor', type: 'relation', required: true, maxSelect: 1, collectionId: admins.id, cascadeDelete: false },
    { name: 'booking', type: 'relation', required: true, maxSelect: 1, collectionId: bookings.id, cascadeDelete: false },
    { name: 'action', type: 'text', required: true },
  ]);
}, () => {
  // Rollback deliberately refuses to delete registrations or administrator records.
  throw new Error('Ayambil migration rollback is disabled to preserve event data.');
});
