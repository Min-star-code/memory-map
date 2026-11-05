import type { Chapter } from '../types';

// Chapter: Pointers. All examples and questions are my own; no course slides,
// assignments or exam questions are used. Addresses are made up and short so
// the diagrams stay readable. #include lines are left out of the examples.

export const pointers: Chapter = {
  id: 'pointers',
  number: 5,
  title: 'Pointers',
  summary:
    'What an address is, how & and * work, and how pointers let functions, arrays and the heap share memory.',
  nodes: [
    {
      id: 'addresses',
      title: 'Every variable lives at an address',
      short: 'Addresses',
      pos: { x: 50, y: 12 },
      after: [],
      explain: [
        'A variable is a named box in memory. Each box has an address: a number that says where the box is.',
        'Assigning one variable to another copies the value into a different box. After the copy, the two boxes have nothing to do with each other.',
      ],
      trace: {
        code: [
          'int main(void) {',
          '  int a = 5;',
          '  int b = a;',
          '  b = 7;',
          '  printf("%d %d\\n", a, b);',
          '}',
        ],
        steps: [
          {
            line: 1,
            note: "main starts. Its stack frame has a box for a and a box for b. They have no value yet.",
            stack: [{ fn: 'main', vars: [
              { name: 'a', type: 'int', cells: [{ addr: '0x100', value: '?' }] },
              { name: 'b', type: 'int', cells: [{ addr: '0x104', value: '?' }] },
            ] }],
            heap: [],
          },
          {
            line: 2,
            note: 'a gets the value 5. The box for a is at address 0x100.',
            stack: [{ fn: 'main', vars: [
              { name: 'a', type: 'int', cells: [{ addr: '0x100', value: '5' }] },
              { name: 'b', type: 'int', cells: [{ addr: '0x104', value: '?' }] },
            ] }],
            heap: [],
          },
          {
            line: 3,
            note: "b gets a copy of a's value. The 5 now sits in two separate boxes.",
            stack: [{ fn: 'main', vars: [
              { name: 'a', type: 'int', cells: [{ addr: '0x100', value: '5' }] },
              { name: 'b', type: 'int', cells: [{ addr: '0x104', value: '5' }] },
            ] }],
            heap: [],
          },
          {
            line: 4,
            note: 'Changing b only changes the box at 0x104. a is still 5.',
            stack: [{ fn: 'main', vars: [
              { name: 'a', type: 'int', cells: [{ addr: '0x100', value: '5' }] },
              { name: 'b', type: 'int', cells: [{ addr: '0x104', value: '7' }] },
            ] }],
            heap: [],
          },
          {
            line: 5,
            note: 'The program prints both values.',
            stack: [{ fn: 'main', vars: [
              { name: 'a', type: 'int', cells: [{ addr: '0x100', value: '5' }] },
              { name: 'b', type: 'int', cells: [{ addr: '0x104', value: '7' }] },
            ] }],
            heap: [],
            output: '5 7',
          },
        ],
      },
      questions: [
        {
          id: 'addresses-1',
          kind: 'choice',
          prompt: 'In the example, which statement is true?',
          choices: [
            'a and b share one memory location',
            'a and b are at different addresses, so changing b never changes a',
            'b stores the address of a',
          ],
          answer: 1,
          explanation: '`int b = a;` copies the value. a and b are two boxes at 0x100 and 0x104.',
        },
        {
          id: 'addresses-2',
          kind: 'output',
          prompt: 'What does this print?',
          code: ['int x = 3;', 'int y = x;', 'x = x + 1;', 'printf("%d %d\\n", x, y);'],
          answer: '4 3',
          explanation: 'y got a copy of 3 before x changed, so y stays 3 while x becomes 4.',
        },
        {
          id: 'addresses-3',
          kind: 'choice',
          prompt: 'What is an address?',
          choices: [
            'The name of a variable',
            'A number that says where a box is in memory',
            'The value stored in a variable',
          ],
          answer: 1,
          explanation: 'The name is for you; the address is where the box actually is in memory.',
        },
      ],
    },
    {
      id: 'amp-star',
      title: '& makes a pointer, * follows it',
      short: '& and *',
      pos: { x: 50, y: 40 },
      after: ['addresses'],
      explain: [
        '`&x` gives the address of x. A pointer is a variable whose value is an address, so `int *p = &x;` makes p point at x.',
        '`*p` follows the arrow: it means "the box whose address is in p". Writing `*p = 20;` changes x, even though the line never mentions x.',
      ],
      trace: {
        code: [
          'int main(void) {',
          '  int x = 10;',
          '  int *p = &x;',
          '  *p = 20;',
          '  printf("%d\\n", x);',
          '}',
        ],
        steps: [
          {
            line: 1,
            note: 'main starts with a box for x and a box for p.',
            stack: [{ fn: 'main', vars: [
              { name: 'x', type: 'int', cells: [{ addr: '0x100', value: '?' }] },
              { name: 'p', type: 'int *', cells: [{ addr: '0x108', value: '?' }] },
            ] }],
            heap: [],
          },
          {
            line: 2,
            note: 'x gets 10.',
            stack: [{ fn: 'main', vars: [
              { name: 'x', type: 'int', cells: [{ addr: '0x100', value: '10' }] },
              { name: 'p', type: 'int *', cells: [{ addr: '0x108', value: '?' }] },
            ] }],
            heap: [],
          },
          {
            line: 3,
            note: "&x is x's address, 0x100. p stores that address, so p points at x.",
            stack: [{ fn: 'main', vars: [
              { name: 'x', type: 'int', cells: [{ addr: '0x100', value: '10' }] },
              { name: 'p', type: 'int *', cells: [{ addr: '0x108', value: '0x100', pointsTo: '0x100' }] },
            ] }],
            heap: [],
          },
          {
            line: 4,
            note: '*p follows the arrow to 0x100 and writes 20 there. That box is x.',
            stack: [{ fn: 'main', vars: [
              { name: 'x', type: 'int', cells: [{ addr: '0x100', value: '20' }] },
              { name: 'p', type: 'int *', cells: [{ addr: '0x108', value: '0x100', pointsTo: '0x100' }] },
            ] }],
            heap: [],
          },
          {
            line: 5,
            note: 'x prints as 20.',
            stack: [{ fn: 'main', vars: [
              { name: 'x', type: 'int', cells: [{ addr: '0x100', value: '20' }] },
              { name: 'p', type: 'int *', cells: [{ addr: '0x108', value: '0x100', pointsTo: '0x100' }] },
            ] }],
            heap: [],
            output: '20',
          },
        ],
      },
      questions: [
        {
          id: 'amp-star-1',
          kind: 'choice',
          prompt: 'In `int *p = &x;`, what does p store?',
          choices: ['The value of x', 'The address of x', 'A copy of x'],
          answer: 1,
          explanation: '& gives an address, and a pointer variable stores an address.',
        },
        {
          id: 'amp-star-2',
          kind: 'output',
          prompt: 'What does this print?',
          code: ['int n = 1;', 'int *q = &n;', '*q = *q + 5;', 'printf("%d\\n", n);'],
          answer: '6',
          explanation: '*q is n, so the line reads n, adds 5, and writes 6 back into n.',
        },
        {
          id: 'amp-star-3',
          kind: 'choice',
          prompt: 'What are x and y after this code?',
          code: ['int x = 1, y = 2;', 'int *p = &x;', 'p = &y;', '*p = 9;'],
          choices: ['x = 9, y = 2', 'x = 1, y = 9', 'x = 9, y = 9'],
          answer: 1,
          explanation: '`p = &y;` moves the arrow to y before `*p = 9;` runs, so only y changes.',
        },
      ],
    },
    {
      id: 'params',
      title: 'Pointers let a function change its caller',
      short: 'Parameters',
      pos: { x: 25, y: 70 },
      after: ['amp-star'],
      explain: [
        'C passes arguments by copying them. A function that gets plain ints only changes its own copies.',
        "If the caller passes addresses instead, the function's parameters point back into the caller's frame, and writing through them changes the caller's variables.",
      ],
      trace: {
        code: [
          'void swap(int *a, int *b) {',
          '  int t = *a;',
          '  *a = *b;',
          '  *b = t;',
          '}',
          '',
          'int main(void) {',
          '  int i = 1;',
          '  int j = 2;',
          '  swap(&i, &j);',
          '  printf("%d %d\\n", i, j);',
          '}',
        ],
        steps: [
          {
            line: 7,
            note: 'main starts with boxes for i and j.',
            stack: [{ fn: 'main', vars: [
              { name: 'i', type: 'int', cells: [{ addr: '0x100', value: '?' }] },
              { name: 'j', type: 'int', cells: [{ addr: '0x104', value: '?' }] },
            ] }],
            heap: [],
          },
          {
            line: 8,
            note: 'i gets 1.',
            stack: [{ fn: 'main', vars: [
              { name: 'i', type: 'int', cells: [{ addr: '0x100', value: '1' }] },
              { name: 'j', type: 'int', cells: [{ addr: '0x104', value: '?' }] },
            ] }],
            heap: [],
          },
          {
            line: 9,
            note: 'j gets 2.',
            stack: [{ fn: 'main', vars: [
              { name: 'i', type: 'int', cells: [{ addr: '0x100', value: '1' }] },
              { name: 'j', type: 'int', cells: [{ addr: '0x104', value: '2' }] },
            ] }],
            heap: [],
          },
          {
            line: 1,
            note: "The call copies the addresses &i and &j into swap's parameters. swap gets its own frame on top of main's.",
            stack: [
              { fn: 'main', vars: [
                { name: 'i', type: 'int', cells: [{ addr: '0x100', value: '1' }] },
                { name: 'j', type: 'int', cells: [{ addr: '0x104', value: '2' }] },
              ] },
              { fn: 'swap', vars: [
                { name: 'a', type: 'int *', cells: [{ addr: '0x0f8', value: '0x100', pointsTo: '0x100' }] },
                { name: 'b', type: 'int *', cells: [{ addr: '0x0f0', value: '0x104', pointsTo: '0x104' }] },
                { name: 't', type: 'int', cells: [{ addr: '0x0ec', value: '?' }] },
              ] },
            ],
            heap: [],
          },
          {
            line: 2,
            note: '*a follows a to i, so t gets 1.',
            stack: [
              { fn: 'main', vars: [
                { name: 'i', type: 'int', cells: [{ addr: '0x100', value: '1' }] },
                { name: 'j', type: 'int', cells: [{ addr: '0x104', value: '2' }] },
              ] },
              { fn: 'swap', vars: [
                { name: 'a', type: 'int *', cells: [{ addr: '0x0f8', value: '0x100', pointsTo: '0x100' }] },
                { name: 'b', type: 'int *', cells: [{ addr: '0x0f0', value: '0x104', pointsTo: '0x104' }] },
                { name: 't', type: 'int', cells: [{ addr: '0x0ec', value: '1' }] },
              ] },
            ],
            heap: [],
          },
          {
            line: 3,
            note: "*a = *b copies j's value into i. This writes into main's frame.",
            stack: [
              { fn: 'main', vars: [
                { name: 'i', type: 'int', cells: [{ addr: '0x100', value: '2' }] },
                { name: 'j', type: 'int', cells: [{ addr: '0x104', value: '2' }] },
              ] },
              { fn: 'swap', vars: [
                { name: 'a', type: 'int *', cells: [{ addr: '0x0f8', value: '0x100', pointsTo: '0x100' }] },
                { name: 'b', type: 'int *', cells: [{ addr: '0x0f0', value: '0x104', pointsTo: '0x104' }] },
                { name: 't', type: 'int', cells: [{ addr: '0x0ec', value: '1' }] },
              ] },
            ],
            heap: [],
          },
          {
            line: 4,
            note: '*b = t puts the saved 1 into j.',
            stack: [
              { fn: 'main', vars: [
                { name: 'i', type: 'int', cells: [{ addr: '0x100', value: '2' }] },
                { name: 'j', type: 'int', cells: [{ addr: '0x104', value: '1' }] },
              ] },
              { fn: 'swap', vars: [
                { name: 'a', type: 'int *', cells: [{ addr: '0x0f8', value: '0x100', pointsTo: '0x100' }] },
                { name: 'b', type: 'int *', cells: [{ addr: '0x0f0', value: '0x104', pointsTo: '0x104' }] },
                { name: 't', type: 'int', cells: [{ addr: '0x0ec', value: '1' }] },
              ] },
            ],
            heap: [],
          },
          {
            line: 5,
            note: "swap returns and its frame is gone. main's i and j stay swapped.",
            stack: [{ fn: 'main', vars: [
              { name: 'i', type: 'int', cells: [{ addr: '0x100', value: '2' }] },
              { name: 'j', type: 'int', cells: [{ addr: '0x104', value: '1' }] },
            ] }],
            heap: [],
          },
          {
            line: 11,
            note: 'The program prints the swapped values.',
            stack: [{ fn: 'main', vars: [
              { name: 'i', type: 'int', cells: [{ addr: '0x100', value: '2' }] },
              { name: 'j', type: 'int', cells: [{ addr: '0x104', value: '1' }] },
            ] }],
            heap: [],
            output: '2 1',
          },
        ],
      },
      questions: [
        {
          id: 'params-1',
          kind: 'choice',
          prompt: 'This version takes plain ints. With i = 1 and j = 2, what does main print after swap2(i, j)?',
          code: ['void swap2(int a, int b) {', '  int t = a;', '  a = b;', '  b = t;', '}'],
          choices: ['2 1', '1 2', 'It does not compile'],
          answer: 1,
          explanation: 'swap2 swaps its own copies. When it returns, the copies disappear and i and j are unchanged.',
        },
        {
          id: 'params-2',
          kind: 'choice',
          prompt: 'Why does swap take int * parameters?',
          choices: [
            "So it can change the caller's variables through their addresses",
            'Because pointers are faster than ints',
            'Because C does not allow two int parameters',
          ],
          answer: 0,
          explanation: "Passing addresses is how a C function changes variables that live in its caller's frame.",
        },
        {
          id: 'params-3',
          kind: 'output',
          prompt: 'What does this print?',
          code: [
            'void add_one(int *n) {',
            '  *n = *n + 1;',
            '}',
            '',
            'int main(void) {',
            '  int k = 4;',
            '  add_one(&k);',
            '  add_one(&k);',
            '  printf("%d\\n", k);',
            '}',
          ],
          answer: '6',
          explanation: 'Each call writes through n into k, so k goes 4 → 5 → 6.',
        },
      ],
    },
    {
      id: 'arrays',
      title: 'Arrays and pointer arithmetic',
      short: 'Arrays',
      pos: { x: 75, y: 70 },
      after: ['amp-star'],
      explain: [
        'An array is a row of boxes next to each other. Used as a value, the array name becomes the address of its first box.',
        'Adding 1 to a pointer moves it to the next element, not the next byte: for an int * it moves by sizeof(int). That is why arr[i] means *(arr + i).',
      ],
      trace: {
        code: [
          'int main(void) {',
          '  int arr[3] = {4, 8, 15};',
          '  int *q = arr;',
          '  q = q + 1;',
          '  *q = 9;',
          '  printf("%d %d\\n", arr[1], *(q + 1));',
          '}',
        ],
        steps: [
          {
            line: 1,
            note: 'main starts with three boxes in a row for arr and one box for q.',
            stack: [{ fn: 'main', vars: [
              { name: 'arr', type: 'int[3]', cells: [
                { addr: '0x100', value: '?' }, { addr: '0x104', value: '?' }, { addr: '0x108', value: '?' },
              ] },
              { name: 'q', type: 'int *', cells: [{ addr: '0x110', value: '?' }] },
            ] }],
            heap: [],
          },
          {
            line: 2,
            note: 'The three elements get 4, 8 and 15. Each int takes 4 bytes, so the addresses go up by 4.',
            stack: [{ fn: 'main', vars: [
              { name: 'arr', type: 'int[3]', cells: [
                { addr: '0x100', value: '4' }, { addr: '0x104', value: '8' }, { addr: '0x108', value: '15' },
              ] },
              { name: 'q', type: 'int *', cells: [{ addr: '0x110', value: '?' }] },
            ] }],
            heap: [],
          },
          {
            line: 3,
            note: 'arr used as a value is the address of arr[0], so q points at the first element.',
            stack: [{ fn: 'main', vars: [
              { name: 'arr', type: 'int[3]', cells: [
                { addr: '0x100', value: '4' }, { addr: '0x104', value: '8' }, { addr: '0x108', value: '15' },
              ] },
              { name: 'q', type: 'int *', cells: [{ addr: '0x110', value: '0x100', pointsTo: '0x100' }] },
            ] }],
            heap: [],
          },
          {
            line: 4,
            note: 'q + 1 moves one int forward: from 0x100 to 0x104, which is arr[1].',
            stack: [{ fn: 'main', vars: [
              { name: 'arr', type: 'int[3]', cells: [
                { addr: '0x100', value: '4' }, { addr: '0x104', value: '8' }, { addr: '0x108', value: '15' },
              ] },
              { name: 'q', type: 'int *', cells: [{ addr: '0x110', value: '0x104', pointsTo: '0x104' }] },
            ] }],
            heap: [],
          },
          {
            line: 5,
            note: '*q = 9 writes into arr[1].',
            stack: [{ fn: 'main', vars: [
              { name: 'arr', type: 'int[3]', cells: [
                { addr: '0x100', value: '4' }, { addr: '0x104', value: '9' }, { addr: '0x108', value: '15' },
              ] },
              { name: 'q', type: 'int *', cells: [{ addr: '0x110', value: '0x104', pointsTo: '0x104' }] },
            ] }],
            heap: [],
          },
          {
            line: 6,
            note: 'arr[1] is 9, and *(q + 1) is the element after arr[1], which is 15.',
            stack: [{ fn: 'main', vars: [
              { name: 'arr', type: 'int[3]', cells: [
                { addr: '0x100', value: '4' }, { addr: '0x104', value: '9' }, { addr: '0x108', value: '15' },
              ] },
              { name: 'q', type: 'int *', cells: [{ addr: '0x110', value: '0x104', pointsTo: '0x104' }] },
            ] }],
            heap: [],
            output: '9 15',
          },
        ],
      },
      questions: [
        {
          id: 'arrays-1',
          kind: 'choice',
          prompt: 'q is an int * holding 0x200, and an int is 4 bytes. What address does q + 2 hold?',
          choices: ['0x202', '0x208', '0x204'],
          answer: 1,
          explanation: 'Pointer arithmetic counts elements: 2 ints × 4 bytes = 8 bytes past 0x200.',
        },
        {
          id: 'arrays-2',
          kind: 'output',
          prompt: 'What does this print?',
          code: ['int a[4] = {1, 2, 3, 4};', 'int *p = a + 3;', 'printf("%d\\n", *p - a[0]);'],
          answer: '3',
          explanation: 'p points at a[3], which is 4. 4 - a[0] = 4 - 1 = 3.',
        },
        {
          id: 'arrays-3',
          kind: 'choice',
          prompt: 'Which expression means the same as arr[i]?',
          choices: ['*(arr + i)', '*arr + i', '&arr + i'],
          answer: 0,
          explanation: 'arr + i is the address of element i, and * reads the box there. *arr + i adds i to arr[0] instead.',
        },
      ],
    },
    {
      id: 'heap',
      title: 'malloc and free: memory on the heap',
      short: 'Heap',
      pos: { x: 50, y: 90 },
      after: ['amp-star'],
      explain: [
        'Stack boxes disappear when their function returns. malloc reserves a box on the heap that stays until you call free, and returns its address.',
        'After free, the pointer still holds the old address, but the box is no longer yours. That is a dangling pointer; setting it to NULL makes the mistake easier to catch.',
      ],
      trace: {
        code: [
          'int main(void) {',
          '  int *p = malloc(sizeof(int));',
          '  *p = 42;',
          '  printf("%d\\n", *p);',
          '  free(p);',
          '  p = NULL;',
          '}',
        ],
        steps: [
          {
            line: 1,
            note: 'main starts with one box for the pointer p. The heap is empty.',
            stack: [{ fn: 'main', vars: [
              { name: 'p', type: 'int *', cells: [{ addr: '0x100', value: '?' }] },
            ] }],
            heap: [],
          },
          {
            line: 2,
            note: 'malloc reserves room for one int on the heap and returns its address. The value inside is not set yet.',
            stack: [{ fn: 'main', vars: [
              { name: 'p', type: 'int *', cells: [{ addr: '0x100', value: '0x5a0', pointsTo: '0x5a0' }] },
            ] }],
            heap: [{ type: 'int', cells: [{ addr: '0x5a0', value: '?' }] }],
          },
          {
            line: 3,
            note: '*p = 42 writes into the heap box.',
            stack: [{ fn: 'main', vars: [
              { name: 'p', type: 'int *', cells: [{ addr: '0x100', value: '0x5a0', pointsTo: '0x5a0' }] },
            ] }],
            heap: [{ type: 'int', cells: [{ addr: '0x5a0', value: '42' }] }],
          },
          {
            line: 4,
            note: '*p reads the heap box and prints 42.',
            stack: [{ fn: 'main', vars: [
              { name: 'p', type: 'int *', cells: [{ addr: '0x100', value: '0x5a0', pointsTo: '0x5a0' }] },
            ] }],
            heap: [{ type: 'int', cells: [{ addr: '0x5a0', value: '42' }] }],
            output: '42',
          },
          {
            line: 5,
            note: 'free gives the box back. p still holds 0x5a0, so it is now a dangling pointer: using *p here would be undefined behaviour.',
            stack: [{ fn: 'main', vars: [
              { name: 'p', type: 'int *', cells: [{ addr: '0x100', value: '0x5a0', pointsTo: '0x5a0' }] },
            ] }],
            heap: [{ type: 'int', freed: true, cells: [{ addr: '0x5a0', value: '?' }] }],
            output: '42',
          },
          {
            line: 6,
            note: 'Setting p to NULL means nothing points at the freed memory any more.',
            stack: [{ fn: 'main', vars: [
              { name: 'p', type: 'int *', cells: [{ addr: '0x100', value: 'NULL' }] },
            ] }],
            heap: [],
            output: '42',
          },
        ],
      },
      questions: [
        {
          id: 'heap-1',
          kind: 'choice',
          prompt: 'Right after free(p), before p = NULL, what does p hold?',
          choices: ['NULL', 'The old address of the freed block', '0'],
          answer: 1,
          explanation: 'free does not change p. p still holds the old address, which is why it is called dangling.',
        },
        {
          id: 'heap-2',
          kind: 'choice',
          prompt: 'What is wrong with this function?',
          code: ['int *make_five(void) {', '  int n = 5;', '  return &n;', '}'],
          choices: [
            'Nothing',
            'It returns the address of a local variable that no longer exists after the function returns',
            'It should use * instead of &',
          ],
          answer: 1,
          explanation: "n lives in make_five's stack frame, which is gone after the return. Use malloc if the value must outlive the call.",
        },
        {
          id: 'heap-3',
          kind: 'choice',
          prompt: 'Which snippet leaks memory?',
          choices: [
            'p = malloc(sizeof(int)); p = malloc(sizeof(int)); free(p);',
            'p = malloc(sizeof(int)); free(p); p = NULL;',
            'p = NULL;',
          ],
          answer: 0,
          explanation: 'The second malloc overwrites the only address of the first block, so the first block can never be freed.',
        },
      ],
    },
  ],
};
