module.exports = {
  apps: [
    {
      name: "dzen",
      cwd: "/opt/dzen/current",
      script: "server.js",
      node_args: "--env-file=/opt/dzen/shared/.env.local",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "127.0.0.1",
      },
      max_memory_restart: "500M",
    },
  ],
};
