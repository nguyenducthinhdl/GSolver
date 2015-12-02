# GSolver
Graph problem solver in JavaScript

- For solving the searching problem.

Feature:
- Support searching algorithm:
  - Depth-first search: https://en.wikipedia.org/wiki/Depth-first_search
  - Best-first_search: https://en.wikipedia.org/wiki/Best-first_search
  - Dijkstra: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
  - A-star: https://en.wikipedia.org/wiki/A*_search_algorithm
- Support for building graph as a problem:
  - Relation between State, Action and Goal: http://artint.info/html/ArtInt_201.html
  - Building rule to generate all next actions.
  - Using heap tree structure as an open heap for A-star algorithm.
  - Default cloning, comparing function for an object, array or native variable (number, string).
  - Builing black list to store the visited state by hash code function.

Using:
- Main idea:
  - A problem is described by 3 components: http://artint.info/html/ArtInt_201.html
    - States: the state of problem. The begining state is the init state.
    - Action: the action which can impact on a state, the consequence is an other state
    - Goal: the target states to find. 
    - Searching problem: Find a path from init state to a goal on a graph.
    - Rule: We add this concept as a rule for serveral problems types.
  
