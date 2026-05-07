async function test() {
  try {
    const email = `test_${Date.now()}@mail.com`;
    console.log("Registering:", email);
    
    const regRes = await fetch('http://localhost:4000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "Test User",
        email: email,
        password: "password123"
      })
    });
    
    const regData = await regRes.json();
    const cookies = regRes.headers.get('set-cookie');
    if (!cookies) throw new Error("No cookies returned");
    
    const config = {
      headers: { 
        'Cookie': cookies,
        'Content-Type': 'application/json' 
      }
    };

    console.log("1. Update User...");
    const pRes = await fetch('http://localhost:4000/api/users/update', {
      method: 'PUT',
      ...config,
      body: JSON.stringify({ onboarded: true, age: 25, gender: "Male" })
    });
    const pData = await pRes.json();
    console.log("Update OK", pRes.status, pData);

    console.log("2. Create Goal...");
    let goalId = null;
    const gRes = await fetch('http://localhost:4000/api/goals/create_goal', {
      method: 'POST',
      ...config,
      body: JSON.stringify({
        goal_title: "Test Goal",
        goal_status: "active"
      })
    });
    const gData = await gRes.json();
    console.log("Goal OK", gRes.status, gData);
    if(gData.goal) goalId = gData.goal._id;

    console.log("3. Create Habit (independent)...");
    const h1Res = await fetch('http://localhost:4000/api/habits/create_habit', {
      method: 'POST',
      ...config,
      body: JSON.stringify({
        habit_title: "Test Habit",
        target_value: "10 mins",
        frequency: "Daily"
      })
    });
    const h1Data = await h1Res.json();
    console.log("Habit 1 OK", h1Res.status, h1Data);

    console.log("4. Create Habit (goal)...");
    const h2Res = await fetch('http://localhost:4000/api/habits/create_habit', {
      method: 'POST',
      ...config,
      body: JSON.stringify({
        habit_title: "Goal Habit",
        target_value: "5 reps",
        frequency: "Weekly",
        goalId: goalId
      })
    });
    const h2Data = await h2Res.json();
    console.log("Habit 2 OK", h2Res.status, h2Data);
    
  } catch (err) {
    console.error("Main error:", err);
  }
}

test();
