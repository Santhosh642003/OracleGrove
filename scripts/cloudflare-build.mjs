import "./sites-env.mjs";
process.env.ORACLE_CLOUDFLARE = "1";
process.argv = [process.execPath, process.argv[1], "build"];
await import("./run-framework.mjs");
