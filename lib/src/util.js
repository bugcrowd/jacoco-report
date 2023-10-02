"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIssueNumberFromCommitPullsList = exports.getFilesWithCoverage = exports.getChangedLines = exports.debug = exports.TAG = void 0;
exports.TAG = {
    SELF: '$',
    SOURCE_FILE: 'sourcefile',
    LINE: 'line',
    COUNTER: 'counter',
    PACKAGE: 'package',
    GROUP: 'group',
};
function debug(obj) {
    return JSON.stringify(obj, null, 4);
}
exports.debug = debug;
const pattern = /^@@ -([0-9]*),?\S* \+([0-9]*),?/;
function getChangedLines(patch) {
    const lineNumbers = new Set();
    if (patch) {
        const lines = patch.split('\n');
        const groups = getDiffGroups(lines);
        for (const group of groups) {
            const firstLine = group.shift();
            if (firstLine) {
                const diffGroup = firstLine.match(pattern);
                if (diffGroup) {
                    let bX = parseInt(diffGroup[2]);
                    for (const line of group) {
                        bX++;
                        if (line.startsWith('+')) {
                            lineNumbers.add(bX - 1);
                        }
                        else if (line.startsWith('-')) {
                            bX--;
                        }
                    }
                }
            }
        }
    }
    return [...lineNumbers];
}
exports.getChangedLines = getChangedLines;
function getDiffGroups(lines) {
    const groups = [];
    let group = [];
    for (const line of lines) {
        if (line.startsWith('@@')) {
            group = [];
            groups.push(group);
        }
        group.push(line);
    }
    return groups;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
function getFilesWithCoverage(packages) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const files = [];
    for (const item of packages) {
        const packageName = item[exports.TAG.SELF].name;
        const sourceFiles = (_a = item[exports.TAG.SOURCE_FILE]) !== null && _a !== void 0 ? _a : [];
        for (const sourceFile of sourceFiles) {
            const sourceFileName = sourceFile[exports.TAG.SELF].name;
            const file = {
                name: sourceFileName,
                packageName,
                lines: [],
                counters: [],
            };
            const counters = (_b = sourceFile[exports.TAG.COUNTER]) !== null && _b !== void 0 ? _b : [];
            for (const counter of counters) {
                const counterSelf = counter[exports.TAG.SELF];
                const type = counterSelf.type;
                file.counters.push({
                    name: type.toLowerCase(),
                    missed: (_c = parseInt(counterSelf.missed)) !== null && _c !== void 0 ? _c : 0,
                    covered: (_d = parseInt(counterSelf.covered)) !== null && _d !== void 0 ? _d : 0,
                });
            }
            const lines = (_e = sourceFile[exports.TAG.LINE]) !== null && _e !== void 0 ? _e : [];
            for (const line of lines) {
                const lineSelf = line[exports.TAG.SELF];
                file.lines.push({
                    number: (_f = parseInt(lineSelf.nr)) !== null && _f !== void 0 ? _f : 0,
                    instruction: {
                        missed: (_g = parseInt(lineSelf.mi)) !== null && _g !== void 0 ? _g : 0,
                        covered: (_h = parseInt(lineSelf.ci)) !== null && _h !== void 0 ? _h : 0,
                    },
                    branch: {
                        missed: (_j = parseInt(lineSelf.mb)) !== null && _j !== void 0 ? _j : 0,
                        covered: (_k = parseInt(lineSelf.cb)) !== null && _k !== void 0 ? _k : 0,
                    },
                });
            }
            files.push(file);
        }
    }
    return files;
}
exports.getFilesWithCoverage = getFilesWithCoverage;
//  Copied from
// https://github.com/mshick/add-pr-comment/blob/main/src/issues.ts
function getIssueNumberFromCommitPullsList(octokit, owner, repo, commitSha) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const commitPullsList = yield octokit.rest.repos.listPullRequestsAssociatedWithCommit({
            owner,
            repo,
            commit_sha: commitSha,
        });
        return commitPullsList.data.length ? (_a = commitPullsList.data) === null || _a === void 0 ? void 0 : _a[0].number : null;
    });
}
exports.getIssueNumberFromCommitPullsList = getIssueNumberFromCommitPullsList;
