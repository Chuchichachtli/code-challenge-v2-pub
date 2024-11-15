## Implementation Details

To kind of align with the co-crafter's backend I tried to learn Nest.JS real quick and it didn't happen all that quick. I have also had limited experience with ORMs, so excuse my code it's not my best. It's also not exactly complete. 

I'll be honest it took me some hours to set up the thing because it was my first time setting both NestJS and typeORM up. 

I've approached the problem by first thinking about the DB structures needed, and cascading and so on. But in hindsight I should have first thought about what to do with the S3 bucket situation.

I stand behind the tree structure I used I think that's nice and neat and helps not reinvent the wheel. I'm not very happy about the way I get the paths of folders/docs, which is getting all folders that lead there and concatenating the names. 

The implementation itself took around 4-5 hours for me after tinkering with the setup.

I think the effect updating/deleting of the folders causes in S3 is the biggest challenge. Going over all keys/paths you name it and updating them. To be fair the way to solve it is out there: you get the descendants of the folder and you update them one by one, both in DB and S3. I'm unfortunately out of time though because I spent more time setting up/learning than I maybe should've.



The implementation is missing : 
- Updating the folders' and documents' paths in the AWS bucket on Folder `PATCH`
- Can't delete the sub folders/docs on Folder `DELETE`. -> For this I thought AWS would have a delete path/* like thing but alas. 

I've used the `@Tree('closure-table')` in the folders to easily access descendants / ancestors, in this case parent and sub folders. 

There are quite a few places I'd do things differently. 

- I'd maybe save the S3 Urls for sure in the DB, but I started that a bit late, whelp. Getting it always from the DB by getting all folders in the path is not the most efficient. 
- I was honestly a bit lazy to create DTOs for the endpoints for now.
- I'd filter out parentFolder columns for the Folders.
- I also haven't really used functions in a very structured way, but since I haven't been able to finish the func. so that'd come after for me for a coding challenge.
- I would also use a lot more helper functions in general.
- I'd also add unique naming for new folders - like New Folder (1), New Folder (2) and so on. 
- Also enforce path uniqueness for the documents, meaning no 2 document names in 1 folder could be the same.