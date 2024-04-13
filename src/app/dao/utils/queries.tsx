// queries.tsx

export const proposalsQuery = `
  {
    proposals (
      first: 10,
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
      space {
        id
        name
      }
    }
  }
`;


