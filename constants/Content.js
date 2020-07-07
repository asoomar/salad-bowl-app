export const giveFeedbackContent = {
  title: "Give Us Feedback",
  content: "Let us know how you like Salad Bowl! " + 
    "Giving us feedback helps us improve the game for everyone!"
}

 export const errorContent = (number) => {
  return ({
    title: "Uh Oh!",
    content: `We messed up! Sorry, we accidentally did something that ` + 
    `ended your game! \n(Error #${number})`
  })
 }

 export const hostLeftContent = {
   title: "Uh Oh!",
   content: "The game ended because the host left"
 }