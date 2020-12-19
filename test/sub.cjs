process.on('message', (m) => {
  console.log('CHILD got message:', m);
});

process.send({ hello: 'world' });
