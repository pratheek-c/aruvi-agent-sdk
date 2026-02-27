"use strict";
/**
 * Example 2: Streaming Responses
 * Demonstrates real-time streaming from different providers
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
// Example 2.1: Stream from OpenAI
function streamOpenAI() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, messages, _a, _b, _c, chunk, e_1_1, error_1;
        var _d, e_1, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    console.log("\n📌 Example 2.1: Streaming from OpenAI");
                    provider = new aruvi_1.OpenAIProvider(process.env.OPENAI_API_KEY, "gpt-4o-mini");
                    messages = [
                        { role: "user", content: "Write a haiku about technology" }
                    ];
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 14, , 15]);
                    console.log("Response (streaming): ");
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
                    console.log("\n✓ Streaming completed\n");
                    return [3 /*break*/, 15];
                case 14:
                    error_1 = _g.sent();
                    console.error("Error:", error_1);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Example 2.2: Stream and collect
function streamAndCollect() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, messages, fullResponse, chunkCount, _a, _b, _c, chunk, e_2_1, error_2;
        var _d, e_2, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    console.log("\n📌 Example 2.2: Stream and Collect Response");
                    provider = new aruvi_1.ClaudeProvider(process.env.ANTHROPIC_API_KEY, "claude-3-sonnet-20240229");
                    messages = [
                        { role: "user", content: "List 5 programming languages and brief descriptions" }
                    ];
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 14, , 15]);
                    fullResponse = "";
                    chunkCount = 0;
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
                    fullResponse += chunk;
                    chunkCount++;
                    _g.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_2_1 = _g.sent();
                    e_2 = { error: e_2_1 };
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
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    console.log("Full Response:", fullResponse);
                    console.log("Received ".concat(chunkCount, " chunks"));
                    return [3 /*break*/, 15];
                case 14:
                    error_2 = _g.sent();
                    console.error("Error:", error_2);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Example 2.3: Streaming with progress indicator
function streamWithProgress() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, messages, chunkCount, _a, _b, _c, chunk, e_3_1, error_3;
        var _d, e_3, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    console.log("\n📌 Example 2.3: Streaming with Progress");
                    provider = new aruvi_1.OllamaProvider("llama3");
                    messages = [
                        { role: "user", content: "Explain quantum computing" }
                    ];
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 14, , 15]);
                    console.log("Streaming: ");
                    chunkCount = 0;
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
                    process.stdout.write(chunk);
                    chunkCount++;
                    // Show progress every 10 chunks
                    if (chunkCount % 10 === 0) {
                        process.stdout.write(" [".concat(chunkCount, " chunks]"));
                    }
                    _g.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_3_1 = _g.sent();
                    e_3 = { error: e_3_1 };
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
                    if (e_3) throw e_3.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    console.log("\n\u2713 Completed with ".concat(chunkCount, " total chunks"));
                    return [3 /*break*/, 15];
                case 14:
                    error_3 = _g.sent();
                    console.error("Error (make sure Ollama is running):", error_3);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Run examples
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var e_4, e_5, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🚀 Streaming Examples");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, streamOpenAI()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_4 = _a.sent();
                    console.log("OpenAI streaming example skipped");
                    return [3 /*break*/, 4];
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, streamAndCollect()];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_5 = _a.sent();
                    console.log("Collect example skipped");
                    return [3 /*break*/, 7];
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, streamWithProgress()];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_6 = _a.sent();
                    console.log("Ollama streaming example skipped");
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
