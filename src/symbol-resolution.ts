import { ISymbolTable, SymbolTable, SymbolType } from "./symbol-table";

//
// Defines a function that can resolve symbols for an AST node.
//
type NodeHandler = (node: any, symbolTable: ISymbolTable) => void;

//
// Lookup table for funtions that handle code generation for each node.
//
interface INodeHandlerMap {
    [index: string]: NodeHandler | undefined;
}

//
// Handles symbol resolution for the Aqua compiler.
//
export class SymbolResolution {

    //
    // Resolve symbols, annotates the AST and binds variables (etc) to their symbol table entries.
    // Computes space required by functions for local variables.
    //
    resolveSymbols(node: any): void {

        //
        // Resolve symbols for the AST and compute storage space.
        //
        const globalSymbolTable = new SymbolTable(0);
        this.internalResolveSymbols(node, globalSymbolTable);
    }

    //
    // Resolves symbols and allocates space for variables.
    //
    private internalResolveSymbols(node: any, symbolTable: ISymbolTable): void {

        if (node.children) {
            for (const child of node.children) {
                this.internalResolveSymbols(child, symbolTable);
            }
        }

        const nodeHandler = this.nodeHandlers[node.nodeType];
        if (nodeHandler) {
            nodeHandler(node, symbolTable);
        }
    }

    //
    // Lookup table for funtions that handle symbol resoluton for each node.
    //
    nodeHandlers: INodeHandlerMap = {
        "function-declaration": (node, symbolTable) => {
            const localSymbolTable = new SymbolTable(0, symbolTable);
            node.scope = localSymbolTable;
        
            this.internalResolveSymbols(node.body, localSymbolTable);
        },
        "declare-variable": (node, symbolTable) => {
            if (symbolTable.isDefinedLocally(node.name)) {
                throw new Error(`${node.name} is already declared!`);
            }
        
            //
            // Allocate a position for the variable in scratch.
            //
            node.symbol = symbolTable.define(node.name, SymbolType.Variable);
        },
        "declare-constant": (node, symbolTable) => {
            if (symbolTable.isDefinedLocally(node.name)) {
                throw new Error(`${node.name} is already declared!`);
            }
        
            //
            // Allocate a position for the variable in scratch.
            //
            node.symbol = symbolTable.define(node.name, SymbolType.Constant);
            
        },
        "access-variable": (node, symbolTable) => {
            const symbol = symbolTable.get(node.name);
            if (symbol === undefined) {
                throw new Error(`Variable ${node.name} is not declared!`);
            }
        
            node.symbol = symbol;
        },
        "assignment-statement": (node, symbolTable) => {
        
            if (node.assignee.nodeType !== "access-variable") {
                throw new Error(`Expected assignee to be an lvalue.`);
            }
        
            const symbol = symbolTable.get(node.assignee.name);
            if (symbol === undefined) {
                throw new Error(`Variable ${node.assignee.name} is not declared!`);
            }
        
            if (symbol.type !== SymbolType.Variable) {
                throw new Error(`Can't set ${symbol.name} because it is not a variable.`);
            }
        
            node.symbol = symbol;
        },
        "if-statement": (node, symbolTable) => {
            //TODO: if statements should have their own symbol tables.
        
            this.internalResolveSymbols(node.ifBlock, symbolTable);
        
            if (node.elseBlock) {
                this.internalResolveSymbols(node.elseBlock, symbolTable);                
            }
        }


    };

}

