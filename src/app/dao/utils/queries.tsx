// queries.tsx

export const proposalsQuery = `
  {
    proposals (
      first: 5,
      skip: 0,
      where: {
        space_in: ["skatehive.eth"],
      },
      orderBy: "created",
      orderDirection: desc
    ) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      created 
      scores
      scores_total
      space {
        id
        name
      }
    }
  }
`;


