module.exports = {
  apps: [
    {
      name: "datek",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 0.0.0.0 -p 3001",
      cwd: "/home/wonderkid/datek-mis-mg",
      instances: 2,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      listen_timeout: 10000,
      kill_timeout: 5000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
