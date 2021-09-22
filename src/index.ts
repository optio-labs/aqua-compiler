const parser = require("./parser");

//
// Compiles an Aqua script to TEAL.
//
export function compile(input: string): string {
    const ast = parser.parse(input);

    const output: string[] = [];
    genCode(ast, output);


    return `#pragma version 3\r\n` + output.join("\r\n");
}

//
// Compiles an expression to TEAL.
//
export function compileExpression(input: string): string {
    const ast = parser.parse(input, { startRule: "expression" });

    const output: string[] = [];
    genCode(ast, output);

    return output.join("\r\n");
}

//
// Generates code from an AST representation of an Aqua script.
//
export function genCode(node: any, output: string[]): void {

    if (node.children) {
        for (const child of node.children) {
            genCode(child, output);
        }
    }

    if (node.nodeType === "operator") {
        output.push(node.opcode);
    }
    else if (node.nodeType === "literal") {
        output.push(`${node.opcode} ${node.value}`);
    }
    else if (node.nodeType === "txn") {
        output.push(`txn ${node.fieldName}`);
    }
    else if (node.nodeType === "arg") {
        output.push(`arg ${node.argIndex}`);
    }
    else if (node.nodeType === "block") {
        // No need for anything else.
    }
    else if (node.nodeType === "statement") {
        if (node.stmtType === "expr") {
            // No need for anything else.
        }
        else if (node.stmtType === "return") {
            output.push(`return`);
        }
        else {
            throw new Error(`Unexpected statement type ${node.stmtType}`);
        }
    }
    else {
        throw new Error(`Unexpected node type ${node.nodeType}`);
    }
}