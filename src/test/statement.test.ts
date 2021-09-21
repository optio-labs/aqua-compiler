import { compile } from "..";
import * as dedent from "dedent";

//
// Normalize whitespace so we don't have to consider it when testing.
//
function normalize(input: string): string {
    return input.split("\n").map(line => line.trim()).join("\n");
}

describe("statement", () => {

    //
    // Compile the input string and check it against the expected output.
    // 
    function check(input: string, expected: string): void {
        const teal = normalize(compile(input));
        const expectedTeal = normalize(expected);
        expect(teal).toEqual(expectedTeal);
    }

    it("can compile an expression statement", ()  => {

        check(
            "1 + 1 ;",
            dedent(`
                int 1
                int 1
                +
            `)
        );
    });

    it("can compile a return statement", ()  => {

        check(
            "return 1 ;",
            dedent(`
                int 1
                return
            `)
        );
    });

    it("can compile multiple statements", ()  => {

        check(
            "1 + 2 ; return 3 ;",
            dedent(`
                int 1
                int 2
                +
                int 3
                return
            `)
        );
    });
});
