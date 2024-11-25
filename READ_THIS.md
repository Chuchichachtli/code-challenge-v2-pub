## Implementation Details

To kind of align with the co-crafter's backend I tried to learn Nest.JS real quick and it didn't happen all that quick. I have also had limited experience with ORMs, so excuse my code it's not my best. It's also not exactly complete. 

I'll be honest it took me some hours to set up the thing because it was my first time setting both NestJS and typeORM up. 

I've approached the problem by first thinking about the DB structures needed, and cascading and so on. But in hindsight I should have first thought about what to do with the S3 bucket situation.

I stand behind the tree structure I used I think that's nice and neat and helps not reinvent the wheel. I'm not very happy about the way I get the paths of folders/docs, which is getting all folders that lead there and concatenating the names. 
I also added paths to documents, which in hindsight made quite a bit of sense. We should optimize for reading not updating folder names. 

The implementation itself took around 4-5 hours for me after tinkering with the setup. 

I think the effect updating/deleting of the folders causes in S3 is the biggest challenge. Going over all keys/paths you name it and updating them. To be fair the way to solve it is out there: you get the descendants of the folder and you update them one by one, both in DB and S3.  ------ DONE

#### Important Note
I forgot to add last time I think : You needed to hit api/v2folders/root with a post request. It's no longer required. 


I've used the `@Tree('closure-table')` in the folders to easily access descendants / ancestors, in this case parent and sub folders. 

There are some things I'd do differently. 

- I'd maybe save the S3 Urls for sure in the DB, but I started that a bit late, whelp. Getting it always from the DB by getting all folders in the path is not the  most efficient.  -----DONE
- I was honestly a bit lazy to create DTOs for the endpoints for now.
- I'd filter out parentFolder columns for the Folders.
- I'd also add unique naming for new folders - like New Folder (1), New Folder (2) and so on. ---- DONE
- Enforce unique sub folder naming in a folder
- Also enforce path uniqueness for the documents, meaning no 2 document names in 1 folder could be the same. 
