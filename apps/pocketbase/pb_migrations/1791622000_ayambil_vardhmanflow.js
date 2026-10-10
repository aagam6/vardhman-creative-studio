migrate(app => {
  const messages = app.findCollectionByNameOrId('ayambil_messages');
  const status = messages.fields.getByName('status');
  if (!status.values.includes('sent')) status.values.push('sent');
  messages.fields.add(new TextField({name:'provider'}));
  app.save(messages);
}, () => { throw new Error('Rollback disabled to preserve message history.'); });
