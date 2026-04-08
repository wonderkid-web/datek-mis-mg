module.exports = {
  apps: [
    {
      name: "datek",
      script: ".next/standalone/server.js",
      cwd: "/home/wonderkid/datek-mis-mg",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        HOSTNAME: "0.0.0.0",
        PORT: 3001,
      },
    },
  ],
};
