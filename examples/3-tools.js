"use strict";
/**
 * Example 3: Creating and Using Tools
 * Shows how to create custom tools and register them with agents
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var aruvi_1 = require("aruvi");
// Example 3.1: Calculator Tool
var calculatorTool = {
    name: "calculator",
    description: "Performs arithmetic operations (add, subtract, multiply, divide)",
    execute: function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var operation, a, b;
            return __generator(this, function (_a) {
                operation = args.operation, a = args.a, b = args.b;
                switch (operation === null || operation === void 0 ? void 0 : operation.toLowerCase()) {
                    case "add":
                        return [2 /*return*/, (a + b).toString()];
                    case "subtract":
                        return [2 /*return*/, (a - b).toString()];
                    case "multiply":
                        return [2 /*return*/, (a * b).toString()];
                    case "divide":
                        return [2 /*return*/, b !== 0 ? (a / b).toString() : "Division by zero"];
                    default:
                        return [2 /*return*/, "Unknown operation"];
                }
                return [2 /*return*/];
            });
        });
    }
};
// Example 3.2: Weather Tool (Mock)
var weatherTool = {
    name: "get_weather",
    description: "Gets the current weather for a city",
    execute: function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var city, weatherData;
            return __generator(this, function (_a) {
                city = args.city;
                weatherData = {
                    "new york": "72°F, Sunny",
                    "london": "15°C, Cloudy",
                    "tokyo": "28°C, Rainy",
                    "paris": "18°C, Clear",
                    "sydney": "25°C, Sunny"
                };
                return [2 /*return*/, weatherData[city === null || city === void 0 ? void 0 : city.toLowerCase()] || "Weather data not available"];
            });
        });
    }
};
// Example 3.3: Timestamp Tool
var timestampTool = {
    name: "get_timestamp",
    description: "Returns the current Unix timestamp and formatted date",
    execute: function () {
        return __awaiter(this, void 0, void 0, function () {
            var now;
            return __generator(this, function (_a) {
                now = new Date();
                return [2 /*return*/, JSON.stringify({
                        timestamp: Math.floor(now.getTime() / 1000),
                        formatted: now.toISOString(),
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    })];
            });
        });
    }
};
// Example: Using an agent with tools
function exampleAgentWithTools() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, agent, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n📌 Example 3: Agent with Tools");
                    provider = new aruvi_1.OpenAIProvider(process.env.OPENAI_API_KEY, "gpt-4o-mini");
                    agent = new aruvi_1.Agent(provider, {
                        systemPrompt: "You are a helpful assistant that can perform calculations and check weather.",
                        maxToolIterations: 5
                    });
                    // Register tools
                    agent.registerTool(calculatorTool);
                    agent.registerTool(weatherTool);
                    agent.registerTool(timestampTool);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log("Running agent with query...\n");
                    return [4 /*yield*/, agent.run("What is 45 * 12? Also, what's the weather in Tokyo?")];
                case 2:
                    result = _a.sent();
                    console.log("Agent Result:", result);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Agent error:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Example: Multiple tool usage
function exampleMultipleTools() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, agent, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n📌 Example 3b: Complex Tool Usage");
                    provider = new aruvi_1.OpenAIProvider(process.env.OPENAI_API_KEY, "gpt-4o-mini");
                    agent = new aruvi_1.Agent(provider, {
                        systemPrompt: "You are a helpful assistant with access to various tools.",
                        maxToolIterations: 8
                    });
                    agent.registerTool(calculatorTool);
                    agent.registerTool(weatherTool);
                    agent.registerTool(timestampTool);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, agent.run("Calculate 100 / 4, then tell me the weather in London, and finally give me the current time")];
                case 2:
                    result = _a.sent();
                    console.log("Agent Result:", result);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Agent error:", error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Run examples
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var error_3, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🚀 Tools and Agents Examples");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exampleAgentWithTools()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error("Error:", error_3);
                    return [3 /*break*/, 4];
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, exampleMultipleTools()];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_4 = _a.sent();
                    console.error("Error:", error_4);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
