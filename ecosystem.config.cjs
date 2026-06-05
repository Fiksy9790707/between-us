module.exports = {
  apps: [
    {
      name: "between-us",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: "3000"
      }
    }
  ]
};
