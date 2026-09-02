module.exports = {
  apps: [
    {
      name: 'genc-sosyal',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
