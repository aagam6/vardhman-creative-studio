// Local preparation only. Deploy with matching hooks after explicit review.
// Existing booking capabilities are deliberately not accepted by new hooks.
migrate(app => {
  const collection = app.findCollectionByNameOrId('ayambil_passes');
  collection.fields.add(new TextField({ name: 'download_key', max: 64, hidden: true }));
  collection.fields.add(new TextField({ name: 'download_hash', max: 64, hidden: true }));
  collection.fields.add(new DateField({ name: 'download_expires', hidden: true }));
  collection.indexes.push("CREATE UNIQUE INDEX idx_ayambil_pass_download ON ayambil_passes (download_hash) WHERE download_hash != ''");
  app.save(collection);
  // Do not change existing snapshots, pass numbers or statuses.
  app.findRecordsByFilter('ayambil_passes', 'status = "active"', '', 0, 0).forEach(pass => {
    const key = $security.randomString(64);
    pass.set('download_key', key); pass.set('download_hash', $security.sha256(key));
    pass.set('download_expires', new Date(Date.now() + 7 * 86400000).toISOString()); app.save(pass);
  });
}, () => { throw new Error('Preserve issued capabilities; restore a reviewed backup for rollback.'); });
