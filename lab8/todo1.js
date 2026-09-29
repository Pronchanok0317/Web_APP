function randomNumber(callback) {
    setTimeout(() => {
      const num = Math.floor(Math.random() * 10);
    callback(num);  
    }, 2000);
    }

    function playGame(){
         console.log("Wait 2 second...");
        randomNumber(function (num1)
        {
           
            console.log("Num 1: ", num1);

            if(num1%2!=0){
                console.log("You lost");
                return;
            }
            console.log("Wait 2 second...");
            randomNumber(function (num2)
        {
            
            console.log("Num 2: ", num2);

             if(num2%2!=0){
                console.log("You lost");
                return;
            }
            console.log("Wait 2 second...");
            randomNumber(function (num3)
        {
            
            console.log("Num 3: ", num3);

             if(num3%2!=0){
                console.log("You lost");
                return;
            }
            else{
                console.log("You win");
            }
        });
    });

        });
    }
playGame();

    // getRandomNumber(function(result) {
    // console.log("Random number is: " + result);
    // });