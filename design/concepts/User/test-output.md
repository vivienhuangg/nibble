## test output 1

`vivienhuang@H0K79H2RD4 nibble % deno test -A`
`running 5 tests from ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts`
`Principle: Author creates survey, respondent answers, author views results ... ok (1s)`
`Action: createSurvey requires scaleMin < scaleMax ... ok (543ms)`
`Action: addQuestion requires an existing survey ... ok (593ms)`
`Action: submitResponse requirements are enforced ... ok (984ms)`
`Action: updateResponse successfully updates a response and enforces requirements ... ok (987ms)`
`running 1 test from ./src/concepts/User/UserConcept.test.ts`
`UserConcept: Core User Lifecycle ...`
  `should register a new user successfully ...`
`------- post-test output -------`

`Test: Registering a new user (Alice)`
`----- post-test output end -----`
  `should register a new user successfully ... FAILED (0ms)`
  `should prevent registration with an existing email ...`
`------- post-test output -------`

`Test: Attempting to register with an existing email`
`----- post-test output end -----`
  `should prevent registration with an existing email ... FAILED (0ms)`
  `should prevent registration with empty fields ...`
`------- post-test output -------`

`Test: Attempting to register with empty fields`
`----- post-test output end -----`
  `should prevent registration with empty fields ... FAILED (0ms)`
  `should log in an existing user successfully ...`
`------- post-test output -------`

`Test: Logging in an existing user (Bob)`
`----- post-test output end -----`
  `should log in an existing user successfully ... FAILED (0ms)`
  `should prevent login with incorrect password ...`
`------- post-test output -------`

`Test: Attempting to log in with incorrect password`
`----- post-test output end -----`
  `should prevent login with incorrect password ... FAILED (0ms)`
  `should prevent login for non-existent email ...`
`------- post-test output -------`

`Test: Attempting to log in with non-existent email`
`----- post-test output end -----`
  `should prevent login for non-existent email ... FAILED (1ms)`
  `should prevent login with empty credentials ...`
`------- post-test output -------`

`Test: Attempting to log in with empty credentials`
`----- post-test output end -----`
  `should prevent login with empty credentials ... FAILED (0ms)`
  `should update user name and preferences successfully ...`
`------- post-test output -------`

`Test: Updating user name and preferences (Diana)`
`----- post-test output end -----`
  `should update user name and preferences successfully ... FAILED (1ms)`
  `should update user email successfully ...`
`------- post-test output -------`

`Test: Updating user email (Eve)`
`----- post-test output end -----`
  `should update user email successfully ... FAILED (0ms)`
  `should prevent updating email to an already taken one ...`
`------- post-test output -------`

`Test: Attempting to update email to an already taken one`
`----- post-test output end -----`
  `should prevent updating email to an already taken one ... FAILED (0ms)`
  `should prevent updating a non-existent user ...`
`------- post-test output -------`

`Test: Attempting to update a non-existent user`
`----- post-test output end -----`
  `should prevent updating a non-existent user ... FAILED (1ms)`
  `should correctly retrieve user details ...`
`------- post-test output -------`

`Test: Retrieving user details (Frank)`
`----- post-test output end -----`
  `should correctly retrieve user details ... FAILED (0ms)`
  `should return error for non-existent user details query ...`
`------- post-test output -------`

`Test: Querying details for a non-existent user`
`----- post-test output end -----`
  `should return error for non-existent user details query ... FAILED (0ms)`
  `should correctly retrieve user ID by email ...`
`------- post-test output -------`

`Test: Retrieving user ID by email (Grace)`
`----- post-test output end -----`
  `should correctly retrieve user ID by email ... FAILED (1ms)`
  `should return error for non-existent user ID by email query ...`
`------- post-test output -------`

`Test: Querying ID by email for a non-existent user`
`----- post-test output end -----`
  `should return error for non-existent user ID by email query ... FAILED (0ms)`
  `trace: User principle fulfillment (Alice's Journey) ...`
`------- post-test output -------`

`--- Trace: Alice's Journey to fulfill User concept principle ---`
`Principle: Users are the primary actors and owners of content.`
`Step 1: Alice registers.`
`----- post-test output end -----`
  `trace: User principle fulfillment (Alice's Journey) ... FAILED (0ms)`
`UserConcept: Core User Lifecycle ... FAILED (due to 16 failed steps) (6ms)`

 `ERRORS` 

`UserConcept: Core User Lifecycle ... should register a new user successfully => ./src/concepts/User/UserConcept.test.ts:31:11`
`error: TypeError: Cannot read properties of undefined (reading 'registerUser')`
    `const result = await userConcept.registerUser({`
                                     `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:33:38`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:31:11`

`UserConcept: Core User Lifecycle ... should prevent registration with an existing email => ./src/concepts/User/UserConcept.test.ts:67:11`
`error: TypeError: Cannot read properties of undefined (reading 'registerUser')`
      `await userConcept.registerUser({`
                        `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:72:25`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:67:11`

`UserConcept: Core User Lifecycle ... should prevent registration with empty fields => ./src/concepts/User/UserConcept.test.ts:100:11`
`error: TypeError: Cannot read properties of undefined (reading 'registerUser')`
    `const result1 = await userConcept.registerUser({`
                                      `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:103:39`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:100:11`

`UserConcept: Core User Lifecycle ... should log in an existing user successfully => ./src/concepts/User/UserConcept.test.ts:151:11`
`error: TypeError: Cannot read properties of undefined (reading 'registerUser')`
    `const registerResult = await userConcept.registerUser({`
                                             `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:154:46`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:151:11`

`UserConcept: Core User Lifecycle ... should prevent login with incorrect password => ./src/concepts/User/UserConcept.test.ts:184:11`
`error: TypeError: Cannot read properties of undefined (reading 'registerUser')`
    `await userConcept.registerUser({`
                      `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:187:23`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:184:11`

`UserConcept: Core User Lifecycle ... should prevent login for non-existent email => ./src/concepts/User/UserConcept.test.ts:213:11`
`error: TypeError: Cannot read properties of undefined (reading 'login')`
    `const loginResult = await userConcept.login({`
                                          `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:216:43`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:213:11`

`UserConcept: Core User Lifecycle ... should prevent login with empty credentials => ./src/concepts/User/UserConcept.test.ts:235:11`
`error: TypeError: Cannot read properties of undefined (reading 'login')`
    `const result1 = await userConcept.login({ email: "", password: "pwd" });`
                                      `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:238:39`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:235:11`

`UserConcept: Core User Lifecycle ... should update user name and preferences successfully => ./src/concepts/User/UserConcept.test.ts:266:11`
`error: TypeError: Cannot read properties of undefined (reading 'registerUser')`
      `const registerResult = await userConcept.registerUser({`
                                               `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:271:48`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:266:11`

`UserConcept: Core User Lifecycle ... should update user email successfully => ./src/concepts/User/UserConcept.test.ts:322:11`
`error: TypeError: Cannot read properties of undefined (reading 'registerUser')`
    `const registerResult = await userConcept.registerUser({`
                                             `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:324:46`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:322:11`

`UserConcept: Core User Lifecycle ... should prevent updating email to an already taken one => ./src/concepts/User/UserConcept.test.ts:352:11`
`error: TypeError: Cannot read properties of undefined (reading 'registerUser')`
      `const aliceResult = await userConcept.registerUser({`
                                            `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:357:45`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:352:11`

`UserConcept: Core User Lifecycle ... should prevent updating a non-existent user => ./src/concepts/User/UserConcept.test.ts:393:11`
`error: TypeError: Cannot read properties of undefined (reading 'updateProfile')`
    `const updateResult = await userConcept.updateProfile({`
                                           `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:396:44`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:393:11`

`UserConcept: Core User Lifecycle ... should correctly retrieve user details => ./src/concepts/User/UserConcept.test.ts:415:11`
`error: TypeError: Cannot read properties of undefined (reading 'registerUser')`
    `const registerResult = await userConcept.registerUser({`
                                             `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:417:46`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:415:11`

`UserConcept: Core User Lifecycle ... should return error for non-existent user details query => ./src/concepts/User/UserConcept.test.ts:451:11`
`error: TypeError: Cannot read properties of undefined (reading '_getUserDetails')`
      `const details = await userConcept._getUserDetails({`
                                        `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:456:41`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:451:11`

`UserConcept: Core User Lifecycle ... should correctly retrieve user ID by email => ./src/concepts/User/UserConcept.test.ts:473:11`
`error: TypeError: Cannot read properties of undefined (reading 'registerUser')`
    `const registerResult = await userConcept.registerUser({`
                                             `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:475:46`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:473:11`

`UserConcept: Core User Lifecycle ... should return error for non-existent user ID by email query => ./src/concepts/User/UserConcept.test.ts:502:11`
`error: TypeError: Cannot read properties of undefined (reading '_getUserIDByEmail')`
      `const result = await userConcept._getUserIDByEmail({`
                                       `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:506:40`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:502:11`

`UserConcept: Core User Lifecycle ... trace: User principle fulfillment (Alice's Journey) => ./src/concepts/User/UserConcept.test.ts:526:11`
`error: TypeError: Cannot read properties of undefined (reading 'registerUser')`
      `const registerResult = await userConcept.registerUser({`
                                               `^`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:538:48`
    `at innerWrapped (ext:cli/40_test.js:181:11)`
    `at exitSanitizer (ext:cli/40_test.js:97:33)`
    `at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)`
    `at TestContext.step (ext:cli/40_test.js:511:37)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:526:11`

 `FAILURES` 

`UserConcept: Core User Lifecycle ... should register a new user successfully => ./src/concepts/User/UserConcept.test.ts:31:11`
`UserConcept: Core User Lifecycle ... should prevent registration with an existing email => ./src/concepts/User/UserConcept.test.ts:67:11`
`UserConcept: Core User Lifecycle ... should prevent registration with empty fields => ./src/concepts/User/UserConcept.test.ts:100:11`
`UserConcept: Core User Lifecycle ... should log in an existing user successfully => ./src/concepts/User/UserConcept.test.ts:151:11`
`UserConcept: Core User Lifecycle ... should prevent login with incorrect password => ./src/concepts/User/UserConcept.test.ts:184:11`
`UserConcept: Core User Lifecycle ... should prevent login for non-existent email => ./src/concepts/User/UserConcept.test.ts:213:11`
`UserConcept: Core User Lifecycle ... should prevent login with empty credentials => ./src/concepts/User/UserConcept.test.ts:235:11`
`UserConcept: Core User Lifecycle ... should update user name and preferences successfully => ./src/concepts/User/UserConcept.test.ts:266:11`
`UserConcept: Core User Lifecycle ... should update user email successfully => ./src/concepts/User/UserConcept.test.ts:322:11`
`UserConcept: Core User Lifecycle ... should prevent updating email to an already taken one => ./src/concepts/User/UserConcept.test.ts:352:11`
`UserConcept: Core User Lifecycle ... should prevent updating a non-existent user => ./src/concepts/User/UserConcept.test.ts:393:11`
`UserConcept: Core User Lifecycle ... should correctly retrieve user details => ./src/concepts/User/UserConcept.test.ts:415:11`
`UserConcept: Core User Lifecycle ... should return error for non-existent user details query => ./src/concepts/User/UserConcept.test.ts:451:11`
`UserConcept: Core User Lifecycle ... should correctly retrieve user ID by email => ./src/concepts/User/UserConcept.test.ts:473:11`
`UserConcept: Core User Lifecycle ... should return error for non-existent user ID by email query => ./src/concepts/User/UserConcept.test.ts:502:11`
`UserConcept: Core User Lifecycle ... trace: User principle fulfillment (Alice's Journey) => ./src/concepts/User/UserConcept.test.ts:526:11`

`FAILED | 5 passed | 1 failed (16 steps) (4s)`

`error: Test failed`
`vivienhuang@H0K79H2RD4 nibble %` 


## test output 2

vivienhuang@H0K79H2RD4 nibble % deno test -A
running 5 tests from ./src/concepts/LikertSurvey/LikertSurveyConcept.test.ts
Principle: Author creates survey, respondent answers, author views results ... ok (1s)
Action: createSurvey requires scaleMin < scaleMax ... ok (543ms)
Action: addQuestion requires an existing survey ... ok (593ms)
Action: submitResponse requirements are enforced ... ok (984ms)
Action: updateResponse successfully updates a response and enforces requirements ... ok (987ms)
running 1 test from ./src/concepts/User/UserConcept.test.ts
UserConcept: Core User Lifecycle ...
  should register a new user successfully ...
------- post-test output -------

Test: Registering a new user (Alice)
----- post-test output end -----
  should register a new user successfully ... FAILED (0ms)
  should prevent registration with an existing email ...
------- post-test output -------

Test: Attempting to register with an existing email
----- post-test output end -----
  should prevent registration with an existing email ... FAILED (0ms)
  should prevent registration with empty fields ...
------- post-test output -------

Test: Attempting to register with empty fields
----- post-test output end -----
  should prevent registration with empty fields ... FAILED (0ms)
  should log in an existing user successfully ...
------- post-test output -------

Test: Logging in an existing user (Bob)
----- post-test output end -----
  should log in an existing user successfully ... FAILED (0ms)
  should prevent login with incorrect password ...
------- post-test output -------

Test: Attempting to log in with incorrect password
----- post-test output end -----
  should prevent login with incorrect password ... FAILED (0ms)
  should prevent login for non-existent email ...
------- post-test output -------

Test: Attempting to log in with non-existent email
----- post-test output end -----
  should prevent login for non-existent email ... FAILED (1ms)
  should prevent login with empty credentials ...
------- post-test output -------

Test: Attempting to log in with empty credentials
----- post-test output end -----
  should prevent login with empty credentials ... FAILED (0ms)
  should update user name and preferences successfully ...
------- post-test output -------

Test: Updating user name and preferences (Diana)
----- post-test output end -----
  should update user name and preferences successfully ... FAILED (1ms)
  should update user email successfully ...
------- post-test output -------

Test: Updating user email (Eve)
----- post-test output end -----
  should update user email successfully ... FAILED (0ms)
  should prevent updating email to an already taken one ...
------- post-test output -------

Test: Attempting to update email to an already taken one
----- post-test output end -----
  should prevent updating email to an already taken one ... FAILED (0ms)
  should prevent updating a non-existent user ...
------- post-test output -------

Test: Attempting to update a non-existent user
----- post-test output end -----
  should prevent updating a non-existent user ... FAILED (1ms)
  should correctly retrieve user details ...
------- post-test output -------

Test: Retrieving user details (Frank)
----- post-test output end -----
  should correctly retrieve user details ... FAILED (0ms)
  should return error for non-existent user details query ...
------- post-test output -------

Test: Querying details for a non-existent user
----- post-test output end -----
  should return error for non-existent user details query ... FAILED (0ms)
  should correctly retrieve user ID by email ...
------- post-test output -------

Test: Retrieving user ID by email (Grace)
----- post-test output end -----
  should correctly retrieve user ID by email ... FAILED (1ms)
  should return error for non-existent user ID by email query ...
------- post-test output -------

Test: Querying ID by email for a non-existent user
----- post-test output end -----
  should return error for non-existent user ID by email query ... FAILED (0ms)
  trace: User principle fulfillment (Alice's Journey) ...
------- post-test output -------

--- Trace: Alice's Journey to fulfill User concept principle ---
Principle: Users are the primary actors and owners of content.
Step 1: Alice registers.
----- post-test output end -----
  trace: User principle fulfillment (Alice's Journey) ... FAILED (0ms)
UserConcept: Core User Lifecycle ... FAILED (due to 16 failed steps) (6ms)

 ERRORS 

UserConcept: Core User Lifecycle ... should register a new user successfully => ./src/concepts/User/UserConcept.test.ts:31:11
error: TypeError: Cannot read properties of undefined (reading 'registerUser')
    const result = await userConcept.registerUser({
                                     ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:33:38
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:31:11

UserConcept: Core User Lifecycle ... should prevent registration with an existing email => ./src/concepts/User/UserConcept.test.ts:67:11
error: TypeError: Cannot read properties of undefined (reading 'registerUser')
      await userConcept.registerUser({
                        ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:72:25
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:67:11

UserConcept: Core User Lifecycle ... should prevent registration with empty fields => ./src/concepts/User/UserConcept.test.ts:100:11
error: TypeError: Cannot read properties of undefined (reading 'registerUser')
    const result1 = await userConcept.registerUser({
                                      ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:103:39
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:100:11

UserConcept: Core User Lifecycle ... should log in an existing user successfully => ./src/concepts/User/UserConcept.test.ts:151:11
error: TypeError: Cannot read properties of undefined (reading 'registerUser')
    const registerResult = await userConcept.registerUser({
                                             ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:154:46
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:151:11

UserConcept: Core User Lifecycle ... should prevent login with incorrect password => ./src/concepts/User/UserConcept.test.ts:184:11
error: TypeError: Cannot read properties of undefined (reading 'registerUser')
    await userConcept.registerUser({
                      ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:187:23
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:184:11

UserConcept: Core User Lifecycle ... should prevent login for non-existent email => ./src/concepts/User/UserConcept.test.ts:213:11
error: TypeError: Cannot read properties of undefined (reading 'login')
    const loginResult = await userConcept.login({
                                          ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:216:43
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:213:11

UserConcept: Core User Lifecycle ... should prevent login with empty credentials => ./src/concepts/User/UserConcept.test.ts:235:11
error: TypeError: Cannot read properties of undefined (reading 'login')
    const result1 = await userConcept.login({ email: "", password: "pwd" });
                                      ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:238:39
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:235:11

UserConcept: Core User Lifecycle ... should update user name and preferences successfully => ./src/concepts/User/UserConcept.test.ts:266:11
error: TypeError: Cannot read properties of undefined (reading 'registerUser')
      const registerResult = await userConcept.registerUser({
                                               ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:271:48
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:266:11

UserConcept: Core User Lifecycle ... should update user email successfully => ./src/concepts/User/UserConcept.test.ts:322:11
error: TypeError: Cannot read properties of undefined (reading 'registerUser')
    const registerResult = await userConcept.registerUser({
                                             ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:324:46
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:322:11

UserConcept: Core User Lifecycle ... should prevent updating email to an already taken one => ./src/concepts/User/UserConcept.test.ts:352:11
error: TypeError: Cannot read properties of undefined (reading 'registerUser')
      const aliceResult = await userConcept.registerUser({
                                            ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:357:45
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:352:11

UserConcept: Core User Lifecycle ... should prevent updating a non-existent user => ./src/concepts/User/UserConcept.test.ts:393:11
error: TypeError: Cannot read properties of undefined (reading 'updateProfile')
    const updateResult = await userConcept.updateProfile({
                                           ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:396:44
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:393:11

UserConcept: Core User Lifecycle ... should correctly retrieve user details => ./src/concepts/User/UserConcept.test.ts:415:11
error: TypeError: Cannot read properties of undefined (reading 'registerUser')
    const registerResult = await userConcept.registerUser({
                                             ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:417:46
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:415:11

UserConcept: Core User Lifecycle ... should return error for non-existent user details query => ./src/concepts/User/UserConcept.test.ts:451:11
error: TypeError: Cannot read properties of undefined (reading '_getUserDetails')
      const details = await userConcept._getUserDetails({
                                        ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:456:41
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:451:11

UserConcept: Core User Lifecycle ... should correctly retrieve user ID by email => ./src/concepts/User/UserConcept.test.ts:473:11
error: TypeError: Cannot read properties of undefined (reading 'registerUser')
    const registerResult = await userConcept.registerUser({
                                             ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:475:46
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:473:11

UserConcept: Core User Lifecycle ... should return error for non-existent user ID by email query => ./src/concepts/User/UserConcept.test.ts:502:11
error: TypeError: Cannot read properties of undefined (reading '_getUserIDByEmail')
      const result = await userConcept._getUserIDByEmail({
                                       ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:506:40
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:502:11

UserConcept: Core User Lifecycle ... trace: User principle fulfillment (Alice's Journey) => ./src/concepts/User/UserConcept.test.ts:526:11
error: TypeError: Cannot read properties of undefined (reading 'registerUser')
      const registerResult = await userConcept.registerUser({
                                               ^
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:538:48
    at innerWrapped (ext:cli/40_test.js:181:11)
    at exitSanitizer (ext:cli/40_test.js:97:33)
    at Object.outerWrapped [as fn] (ext:cli/40_test.js:124:20)
    at TestContext.step (ext:cli/40_test.js:511:37)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/User/UserConcept.test.ts:526:11

 FAILURES 

UserConcept: Core User Lifecycle ... should register a new user successfully => ./src/concepts/User/UserConcept.test.ts:31:11
UserConcept: Core User Lifecycle ... should prevent registration with an existing email => ./src/concepts/User/UserConcept.test.ts:67:11
UserConcept: Core User Lifecycle ... should prevent registration with empty fields => ./src/concepts/User/UserConcept.test.ts:100:11
UserConcept: Core User Lifecycle ... should log in an existing user successfully => ./src/concepts/User/UserConcept.test.ts:151:11
UserConcept: Core User Lifecycle ... should prevent login with incorrect password => ./src/concepts/User/UserConcept.test.ts:184:11
UserConcept: Core User Lifecycle ... should prevent login for non-existent email => ./src/concepts/User/UserConcept.test.ts:213:11
UserConcept: Core User Lifecycle ... should prevent login with empty credentials => ./src/concepts/User/UserConcept.test.ts:235:11
UserConcept: Core User Lifecycle ... should update user name and preferences successfully => ./src/concepts/User/UserConcept.test.ts:266:11
UserConcept: Core User Lifecycle ... should update user email successfully => ./src/concepts/User/UserConcept.test.ts:322:11
UserConcept: Core User Lifecycle ... should prevent updating email to an already taken one => ./src/concepts/User/UserConcept.test.ts:352:11
UserConcept: Core User Lifecycle ... should prevent updating a non-existent user => ./src/concepts/User/UserConcept.test.ts:393:11
UserConcept: Core User Lifecycle ... should correctly retrieve user details => ./src/concepts/User/UserConcept.test.ts:415:11
UserConcept: Core User Lifecycle ... should return error for non-existent user details query => ./src/concepts/User/UserConcept.test.ts:451:11
UserConcept: Core User Lifecycle ... should correctly retrieve user ID by email => ./src/concepts/User/UserConcept.test.ts:473:11
UserConcept: Core User Lifecycle ... should return error for non-existent user ID by email query => ./src/concepts/User/UserConcept.test.ts:502:11
UserConcept: Core User Lifecycle ... trace: User principle fulfillment (Alice's Journey) => ./src/concepts/User/UserConcept.test.ts:526:11

FAILED | 5 passed | 1 failed (16 steps) (4s)

error: Test failed
vivienhuang@H0K79H2RD4 nibble % 