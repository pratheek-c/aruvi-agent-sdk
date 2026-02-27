"use strict";
/**
 * Example 5: Advanced Patterns
 * Shows fallback providers, load balancing, and multi-turn conversations
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var aruvi_1 = require("aruvi");
// Example 5.1: Provider Fallback Pattern
function exampleFallback() {
    return __awaiter(this, void 0, void 0, function () {
        function chatWithFallback(messages) {
            return __awaiter(this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
                            console.log("Trying primary provider (OpenAI)...");
                            return [4 /*yield*/, primaryProvider.chat(messages)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_2 = _a.sent();
                            console.log("Primary failed, using fallback (Ollama)...");
                            return [4 /*yield*/, fallbackProvider.chat(messages)];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        var primaryProvider, fallbackProvider, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n📌 Example 5.1: Provider Fallback");
                    primaryProvider = new aruvi_1.OpenAIProvider(process.env.OPENAI_API_KEY, "gpt-4o-mini");
                    fallbackProvider = new aruvi_1.OllamaProvider("llama3");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, chatWithFallback([
                            { role: "user", content: "Hello!" }
                        ])];
                case 2:
                    response = _a.sent();
                    console.log("Response:", response);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Both providers failed");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Example 5.2: Load Balancing
function exampleLoadBalancing() {
    return __awaiter(this, void 0, void 0, function () {
        function selectProvider() {
            return providers[Math.floor(Math.random() * providers.length)];
        }
        var providers, i, provider, response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n📌 Example 5.2: Load Balancing");
                    providers = [
                        new aruvi_1.OpenAIProvider(process.env.OPENAI_API_KEY, "gpt-4o-mini"),
                        new aruvi_1.ClaudeProvider(process.env.ANTHROPIC_API_KEY, "claude-3-sonnet-20240229"),
                        new aruvi_1.OllamaProvider("llama3")
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < 3)) return [3 /*break*/, 5];
                    provider = selectProvider();
                    console.log("Request ".concat(i + 1, ": Using ").concat(provider.name));
                    return [4 /*yield*/, provider.chat([
                            { role: "user", content: "What model are you?" }
                        ])];
                case 3:
                    response = _a.sent();
                    console.log("Response: ".concat(response.substring(0, 100), "..."));
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error("Error:", error_3);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Example 5.3: Multi-Turn Conversation
function exampleMultiTurn() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, messages, conversations, _i, conversations_1, userMessage, response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n📌 Example 5.3: Multi-Turn Conversation");
                    provider = new aruvi_1.OpenAIProvider(process.env.OPENAI_API_KEY, "gpt-4o-mini");
                    messages = [
                        { role: "system", content: "You are a helpful assistant that knows about programming." }
                    ];
                    conversations = [
                        "What is TypeScript?",
                        "How is it different from JavaScript?",
                        "Can you give me a code example?"
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    _i = 0, conversations_1 = conversations;
                    _a.label = 2;
                case 2:
                    if (!(_i < conversations_1.length)) return [3 /*break*/, 5];
                    userMessage = conversations_1[_i];
                    console.log("\nUser: ".concat(userMessage));
                    // Add user message
                    messages.push({ role: "user", content: userMessage });
                    return [4 /*yield*/, provider.chat(messages)];
                case 3:
                    response = _a.sent();
                    console.log("Assistant: ".concat(response));
                    // Add assistant response
                    messages.push({ role: "assistant", content: response });
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("\n✓ Conversation completed");
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
// Example 5.4: Parallel Requests
function exampleParallel() {
    return __awaiter(this, void 0, void 0, function () {
        var providers, messages, results, error_5;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n📌 Example 5.4: Parallel Requests");
                    providers = [
                        new aruvi_1.OpenAIProvider(process.env.OPENAI_API_KEY, "gpt-4o-mini"),
                        new aruvi_1.ClaudeProvider(process.env.ANTHROPIC_API_KEY, "claude-3-sonnet-20240229")
                    ];
                    messages = [
                        { role: "user", content: "What makes a good programming language? (One sentence)" }
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log("Sending requests to multiple providers in parallel...\n");
                    return [4 /*yield*/, Promise.all(providers.map(function (provider) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = {
                                            provider: provider.name
                                        };
                                        return [4 /*yield*/, provider.chat(messages)];
                                    case 1: return [2 /*return*/, (_a.response = _b.sent(),
                                            _a)];
                                }
                            });
                        }); }))];
                case 2:
                    results = _a.sent();
                    results.forEach(function (_a) {
                        var provider = _a.provider, response = _a.response;
                        console.log("".concat(provider, ":"));
                        console.log("  ".concat(response, "\n"));
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error("Error:", error_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Example 5.5: Streaming with Chunking
function exampleStreamingChunks() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, messages, totalContent, _a, _b, _c, chunk, e_1_1, error_6;
        var _d, e_1, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    console.log("\n📌 Example 5.5: Streaming with Chunking");
                    provider = new aruvi_1.OpenAIProvider(process.env.OPENAI_API_KEY, "gpt-4o-mini");
                    messages = [
                        { role: "user", content: "Write a short poem about coding (3 lines)" }
                    ];
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 14, , 15]);
                    console.log("Poem:\n");
                    totalContent = "";
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 7, 8, 13]);
                    _a = true, _b = __asyncValues(provider.stream(messages));
                    _g.label = 3;
                case 3: return [4 /*yield*/, _b.next()];
                case 4:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                    _f = _c.value;
                    _a = false;
                    chunk = _f;
                    totalContent += chunk;
                    process.stdout.write(chunk);
                    _g.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _g.trys.push([8, , 11, 12]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _e.call(_b)];
                case 9:
                    _g.sent();
                    _g.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    console.log("\n\n✓ Streaming completed");
                    console.log("Total characters: ".concat(totalContent.length));
                    return [3 /*break*/, 15];
                case 14:
                    error_6 = _g.sent();
                    console.error("Error:", error_6);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Run examples
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var e_2, e_3, e_4, e_5, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🚀 Advanced Pattern Examples");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exampleFallback()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    console.log("Fallback example skipped");
                    return [3 /*break*/, 4];
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, exampleLoadBalancing()];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_3 = _a.sent();
                    console.log("Load balancing example skipped");
                    return [3 /*break*/, 7];
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, exampleMultiTurn()];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_4 = _a.sent();
                    console.log("Multi-turn example skipped");
                    return [3 /*break*/, 10];
                case 10:
                    _a.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, exampleParallel()];
                case 11:
                    _a.sent();
                    return [3 /*break*/, 13];
                case 12:
                    e_5 = _a.sent();
                    console.log("Parallel example skipped");
                    return [3 /*break*/, 13];
                case 13:
                    _a.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, exampleStreamingChunks()];
                case 14:
                    _a.sent();
                    return [3 /*break*/, 16];
                case 15:
                    e_6 = _a.sent();
                    console.log("Streaming example skipped");
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
