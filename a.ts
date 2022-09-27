// import {
//   Command,
//   EnumType,
// } from "https://deno.land/x/cliffy@v0.25.0/command/mod.ts";

// await new Command()
//   .name("cliffy")
//   .version("0.1.0")
//   .description("Command line framework for Deno")
//   .type("log-level", new EnumType(["debug", "info", "warn", "error"]))
//   .env("DEBUG=<enable:boolean>", "Enable debug output.")
//   .option("-d, --debug", "Enable debug output.")
//   .option("-l, --log-level <level:log-level>", "Set log level.", {
//     default: "info" as const,
//   })
//   .arguments("<input:string> [output:string]")
//   .action((options, ...args) => {})
//   .parse(Deno.args);
