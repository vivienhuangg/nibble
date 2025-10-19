
## overall changes to application
![@all-design-changes][all-design-changes](design/brainstorming/all-design-changes.md)

## interesting moments

1. **Generating overall changes to applications**: I considered at first to give each concept's design changes to Context and ask it to generate a description of overall app changes. However, the LLM responded with only VersionDraftConcept's changes. I think the LLM may have gotten "confused" as I was sending its generated descriptions as context. So, I gave Context the concept .ts files instead, and it worked! 
	1. Link to first response (.md files): [response.202f40c4](context/Users/vivienhuang/6.1040/nibble/design/brainstorming/all%20design%20changes.md/steps/response.202f40c4.md)
	2. Link to second response (.ts files): [response.e89fdc9d](context/design/brainstorming/all-design-changes.md/steps/response.e89fdc9d.md)
2. **Debugging resource leaks**: For Version and VersionDraft, I faced difficulty with TLS resource leaks. I asked both Context and Cursor, both of whom couldn't figure it out. Frustrated, I completely redid the Version and VersionDraft implementations and test cases -- to no avail. One Google search solved everything. At this point I realized that my dependency on AI recently led me to believe that it is always superior to Googling/web-searching. 
	1. [response.6c5db0c9](context/Users/vivienhuang/6.1040/nibble/design/concepts/Version/debugging.md/steps/response.6c5db0c9.md)
	2. [response.06d5e2f0](context/Users/vivienhuang/6.1040/nibble/design/concepts/Version/debugging.md/steps/response.06d5e2f0.md)
	3. [response.6d76b65d](context/Users/vivienhuang/6.1040/nibble/design/concepts/Version/debugging.md/steps/response.6d76b65d.md)
	4. [response.8e4a8a75](context/Users/vivienhuang/6.1040/nibble/design/concepts/Version/debugging.md/steps/response.8e4a8a75.md)
	5. [response.81d1a292](context/Users/vivienhuang/6.1040/nibble/design/concepts/Version/debugging.md/steps/response.81d1a292.md)
	6. [response.0539c6d5](context/Users/vivienhuang/6.1040/nibble/design/concepts/Version/debugging.md/steps/response.0539c6d5.md)
	7. [response.f17842a6](context/Users/vivienhuang/6.1040/nibble/design/concepts/Version/debugging.md/steps/response.f17842a6.md)
3. **Common linting errors**: For all test case generations, there were many type checking failures. One example is the "catch(e)" type error. I thought it was interesting how this was a consistent issue -- a .md file of common deno linting errors would be helpful.
	1. [response.7fe473a0](context/Users/vivienhuang/6.1040/nibble/design/concepts/Annotation/testing.md/steps/response.7fe473a0.md)
4. **Response tone/style**: I tried many different prompt + context combinations to make the responses to design-updates shorter and more concise, adding keywords like "only," "contrasting,", "major," "brief,", "bullet-pointed." I also added the rubric for the assignment, hoping that the LLM would "notice" that verbosity was punished. However, the response never shortened. I can't really find a file for it, but I notice that the background documents for concept implementation and testing generally encourage verbosity and details -- this might be why my prompt engineering didn't really make a difference. 
	1. [prompt.74dc1e84](context/Users/vivienhuang/6.1040/nibble/design/concepts/Ingredient/design-updates.md/steps/prompt.74dc1e84.md)
	2. [prompt.695a36e2](context/Users/vivienhuang/6.1040/nibble/design/concepts/Ingredient/design-updates.md/steps/prompt.695a36e2.md)
	3. [prompt.f8c2d160](context/Users/vivienhuang/6.1040/nibble/design/concepts/Ingredient/design-updates.md/steps/prompt.f8c2d160.md)
	4. [prompt.f63189e7](context/Users/vivienhuang/6.1040/nibble/design/concepts/Ingredient/design-updates.md/steps/prompt.f63189e7.md)
	5. [prompt.fff55a91](context/Users/vivienhuang/6.1040/nibble/design/concepts/Ingredient/design-updates.md/steps/prompt.fff55a91.md)
I didn't notice any other super interesting moments besides the above unfortunately!