


/** Validate Token */

async function validateToken(token){
    const response = await axios.get("http://localhost:8080/verifyuser?token="+token) ;
    if(response.data.error){
       return console.log("error : "+response.data.error)
    }

    console.log(response.data)

    if(response.data.role === "admin"){
        console.log("admin")
    }else{
        location.href = "dashboard.html" ;
    }
}

if(localStorage.getItem("jobs-data")){
    const token = JSON.parse(localStorage.getItem("jobs-data")).token ;
    validateToken(token);
}else{
    location.href="login.html";
}



/** logout activity */
document.getElementById("logout").addEventListener("click", (e)=>{
    localStorage.removeItem("jobs-data");
    location.href="login.html";
})


/** get users list */

async function getUsers(){
   const response = await axios.post("http://localhost:8080/admin/users?token="+JSON.parse(localStorage.getItem("jobs-data")).token);
   if(response.data.error){
       console.log("Error : "+ response.data.error);
   }else{
       console.log(response.data)
      displayUsers(response.data);
   }
}


/** display users in table */ 

 function displayUsers(users){
    if(!users.length){
        console.log("Error to display users into table")
        return ;
    }

    

    users.forEach(async (user) => {
        console.log(user)
        /** check status of user */
        const response =  await axios.post("http://localhost:8080/user/currentjob/"+  user._id.toString());
        console.log(response.data);

        /** add row to rows */
        document.getElementById("users-body").innerHTML += `
          <tr>
            <td>${user.fname} ${user.lname}</td>
           <td>${user.email}</td>
            <td>${response.data && response.data.status}</td>
           <td><button onclick="userReport('${user._id.toString()}')">View Report</button></td>
            <td><button onclick="removeUser('${user._id.toString()}')">Remove User</button></td>
           <td><button onclick="assignJob('${user._id.toString()}')">Assign Job</button></td>
          </tr>
        ` ;
    });
    
    //document.getElementById("users-body").innerHTML = rows;

}

function assignJob(id){
    console.log(id)
   document.getElementById("add-job").classList.remove("d-none")
document.getElementById("user_id").value=id;
}
/** Display Jobs */
function displayJobs(jobs){
    if(!jobs.length){
        console.log("Error to display jobs into table")
        document.getElementById("jobs-body").innerHTML = "";
        return ;
    }

    let rows = "";

    jobs.forEach((job) => {
      

        const {_id, createdAt, start, end, breaks, details, notes, documents} = job ;
        /** add row to rows */
        let doc = documents ? "Download" : "Not Avaible";
        function calcWorkingHours(entry, exit){
            let ent_time = entry.split(':');
            let ext_time = exit.split(':');
            let time_diff ;
 
            if( (ext_time[1] - ent_time[1]) < 0){
                  time_diff = `${ext_time[0] - ent_time[0] - 1} : ${60 + (ext_time[1] - ent_time[1])}` ;
                 console.log(time_diff);
             }else{
                  time_diff = `${ext_time[0] - ent_time[0] } : ${ext_time[1] - ent_time[1]}` ;
                 console.log(time_diff);
             }

             return time_diff ;
        }

        // find breks hour
        function calcBreaks(breakson, breaksover){
            let breaks_on = breakson.split(':');
            let breks_over = breaksover.split(':');
            let breaks_hours ;
 
            if( (breks_over[1] - breaks_on[1]) < 0){
              breaks_hours = `${breks_over[0] - breaks_on[0] - 1} : ${60 + (breks_over[1] - breaks_on[1])}` ;
                 console.log(breaks_hours);
            }else{
              breaks_hours = `${breks_over[0] - breaks_on[0] } : ${breks_over[1] - breaks_on[1]}` ;
             console.log(breaks_hours);
            }

          return breaks_hours ;
       }

        rows += `
          <tr>
            <td>${createdAt}</td>
            <td>${start}</td>
            <td>${breaks.length > 1 ? calcBreaks(breaks[0], breaks[1]) : breaks[0]}</td>
            <td>${end}</td>
            <td>${end ? calcWorkingHours(start, end) : start}</td>
            <td>${details}</td>
            <td>${notes}</td>
            <td><a href = "http://localhost:8080/jobs/getdocument/${_id.toString()}">${doc}</a></td>
            <td><button onclick="editReport('${_id.toString()}')">Edit</button></td>
            <td><button onclick="uploadReport('${job._id.toString()}')">Upload</button></td>
            
          </tr>
        ` ;
    });
    
    document.getElementById("jobs-body").innerHTML = rows;
}


/** get Jobs of user */
async function userReport(id){
  const response = await axios.post("http://localhost:8080/user/"+id+"/jobs?token="+JSON.parse(localStorage.getItem("jobs-data")).token);
       displayJobs(response.data)
}

/** Edit Report */
 function editReport(id){
     console.log(id);
    // display edit form for job //
    document.getElementById("edit-job").classList.remove("d-none");
   // console.log(JSON.parse(job).id)
   document.getElementById("job_id").value = id ;
}

/** Upload Report */
function uploadReport(id){
     // display edit form for job //
     document.getElementById("upload-documents").classList.remove("d-none");
     // console.log(JSON.parse(job).id)
   document.getElementById("upload-id").value = id ;
}



document.getElementById("users-btn").addEventListener("click", ()=>{
    getUsers();
});



/** UI class */
class UI {
    static showNotification(message, className){
        const div = document.createElement('div');
        div.className = `alert alert-${className} mt-3`;
        div.appendChild(document.createTextNode(message));
        const container = document.querySelector('.container');
        const form = document.querySelector('#user-form');
        container.insertBefore(div, form);

        // remove not in 3 seconds
        setTimeout(() => document.querySelector('.alert').remove(), 3000);
    }

    // clear fields method
    static clearFileds(){
        document.querySelector('#start').value = '';
        document.querySelector('#end').value = '';
        document.querySelector('#details').value = '';
        document.querySelector('#notes').value = '';
    }
}


document.getElementById('edit-job-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const start = document.querySelector('#start').value;
    const end = document.querySelector('#end').value;
    const breakson = document.querySelector('#breakson').value;
    const breaksover = document.querySelector('#breaksover').value;
    const details = document.querySelector('#details').value;
    const notes = document.querySelector('#notes').value;

    console.log("works")

    // Validate
    if(start === '' || end === '' || details === ''){
        UI.showNotification('All fields are required!', 'danger');
    }else{
        console.log(start,end,breakson,breaksover,details,notes, document.getElementById("job_id").value);
       const response = await axios.put("http://localhost:8080/jobs/updatejob",{
           start, end, details, breakson,breaksover , notes, 
           job_id : document.getElementById("job_id").value,
           token:JSON.parse(localStorage.getItem("jobs-data")).token
        }) ;

        console.log(response.data)
       if(response.data.error){
           console.log(response.data.error)
       }else{
        console.log("job Added");
        UI.showNotification('Your Job is Successfully Added !', 'success');
        UI.clearFileds();
        document.getElementById("edit-job").classList.add("d-none");

        displayJobs(response.data);
       }

  //  hide edit form for job //
    
    }
});


/**Assign a new Job to employee */

document.getElementById('add-job-form').addEventListener('submit', async (e) => {
    e.preventDefault();
console.log("add job-form submitted")
    let description = document.getElementById('description').value;
    let customer_name = document.getElementById('customer_name').value;
    let price = document.getElementById('price').value ;
    let estimated_time = document.getElementById('estimated_time').value;
    let user_id = document.getElementById('user_id').value;
    console.log(description,customer_name,price,estimated_time, document.getElementById("user_id").value);
    console.log("works")

    // Validate
    if(description === '' || customer_name === '' || price === ''){
        UI.showNotification('All fields are required!', 'danger');
        console.log("user did not provide any")
    }else{
        console.log(description,customer_name,price,estimated_time, document.getElementById("user_id").value);
       const response = await axios.post("http://localhost:8080/jobs/"+user_id+"/addjob?token="+JSON.parse(localStorage.getItem("jobs-data")).token,{
       details:description,
       price,
       estimated_time
    });
          
       if(response.data.error){
           console.log(response.data.error)
      }else{
       console.log("job Assigned");
       UI.showNotification('Your Job is Successfully Assigned !', 'success');
      UI.clearFileds();
       document.getElementById("add-job").classList.add("d-none");
       console.log(response.data);
       //displayJobs(response.data);
      }


    
    }
});

//// jQuery solution:
//var isLoggedIn = jQuery('body').hasClass('logged-in')

// Plain JS:
//var isLoggedIn = document.body.classList.contains('logged-in');
//var ajaxUrl = '/wp-admin/admin-ajax.php';
//var isLoggedIn = false;

// This action-string is used again in the PHP code below!
//var checkAction = 'check-user-state'; 
 
//jQuery.post(ajaxUrl, { action: checkAction }, function(resp) {
 //   if (resp && resp.success && resp.data) {
  //      isLoggedIn = response.data.loggedin;
  //  }

    // Do anything with the isLoggedIn state:
    // Display a Popup, hide the login form, etc.
//});
