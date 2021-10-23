

// *  is user loggedIn ?   */

// if(localStorage.getItem("jobs-data")){
//     console.log("user already logged in ..");
//      let data = JSON.parse(localStorage.getItem("jobs-data")) ;
//       if(data.token === "forbidden"){
//           console.log("token Correct")
//       }else{
//           console.log("token incorrect")
//       }
// }else{
//     console.log("Not logged in.")
// }


/** Validate Token */
if(localStorage.getItem("jobs-data")){
    const token = JSON.parse(localStorage.getItem("jobs-data")).token ;
    displayJobs(token);
}else{
    location.href="login.html"
}


/** logout activity */
document.getElementById("logout").addEventListener("click", (e)=>{
    localStorage.removeItem("jobs-data");
    location.href="login.html";
})


/** UI class */
class UI {
    static showNotification(message, className){
        const div = document.createElement('div');
        div.className = `alert alert-${className}`;
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

/** Job submission listener */
/*
document.querySelector('#job-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const start = document.querySelector('#start').value;
    const end = document.querySelector('#end').value;
    const details = document.querySelector('#details').value;
    const notes = document.querySelector('#notes').value;

    console.log("works")

    // Validate
    if(start === '' || end === '' || details === ''){
        UI.showNotification('All fields are required!', 'danger');
    }else{
       const response = await axios.post("https://jobsprovider.herokuapp.com/jobs/addjob?token="+JSON.parse(localStorage.getItem("jobs-data")).token,
       {start, end, details, notes}) ;
       if(response.data.error){
           console.log(response.data.error)
       }else{
        console.log("job Added");
        UI.showNotification('Your Job is Successfully Added !', 'success');
        UI.clearFileds();

        displayJobs(JSON.parse(localStorage.getItem("jobs-data")).token);
       }
    }
});
*/

async function deleteJob(id){
    const response = await axios.delete("https://jobsprovider.herokuapp.com/jobs/"+id);

    if(response.data.error){
        console.log("unable to delete job")
    }else{
        console.log("deleted job")
    }

    displayJobs(JSON.parse(localStorage.getItem("jobs-data")).token);
}



async function displayJobs(token){
    const res = await axios.post("https://jobsprovider.herokuapp.com/user/jobs?token="+token) ;
    if(res.data.error){
        console.log(res.data.error);
    }else{
      console.log("displayed Job");
      console.log(res.data)
        let rows = "" ;
        res.data.forEach(job => {

            let doc = job.documents ? "Download" : "Not Avaible";
   
          rows += `<tr>
                <td>${job.createdAt}</td>
                <td>${job.start}</td>
                <td>${job.breaks[0]},${job.breaks[1]}</td>
                <td>${job.end}</td>
                <td>${time_diff(job.start,job.end)}</td>
                <td>${job.details}</td>
                <td>${job.notes}</td>
                <td><a href = "https://jobsprovider.herokuapp.com/jobs/getdocument/${job._id.toString()}">${doc}</a></td>
                <td><button onclick="editReport('${job._id.toString()}','${job.start}','${job.breaks[0]}','${job.breaks[1]}','${job.end}','${job.details}','${job.notes}')">Edit</button></td>
                <td><button onclick="uploadReport('${job._id.toString()}')">Upload</button></td>
                <td><button class="btn btn-danger" onclick="deleteJob('${job._id.toString()}')">Delete</button></td>
              </tr>` ;
        });

        document.getElementById("jobs-body").innerHTML = rows;
    }
}

function time_diff(start,end){
    if (start && end){
        let ent_time =start.split(':');
        let ext_time =end.split(':');
        let time_diff ;
 
        if( (ext_time[1] - ent_time[1]) < 0){
              time_diff = `${ext_time[0] - ent_time[0] - 1} : ${60 + (ext_time[1] - ent_time[1])}` ;
             console.log(time_diff);
        }else{
              time_diff = `${ext_time[0] - ent_time[0] } : ${ext_time[1] - ent_time[1]}` ;
             console.log(time_diff);
        }
        return time_diff;
    }

}

function editReport(job_id, start,breakson,breaksover,end,details,notes)

{
    document.getElementById("edit-job").classList.remove("d-none");
    document.getElementById("job_id").value = job_id;
    document.getElementById("start").value = start;
    document.getElementById("breakson").value =breakson;
    document.getElementById("breaksover").value = breaksover;
    document.getElementById("end").value = end;
    document.getElementById("details").value = details;
    document.getElementById("notes").value = notes;
}

document.getElementById("edit-job-form") &&
document.getElementById("edit-job-form").addEventListener("submit",async (e)=>{
    e.preventDefault();
    const job_id =document.getElementById("job_id").value;
    const start = document.getElementById("start").value;
    const breakson = document.getElementById("breakson").value;
    const breaksover =  document.getElementById("breaksover").value;
    const end =  document.getElementById("end").value;
    const details =  document.getElementById("details").value;
    const notes = document.getElementById("notes").value;
    const token = JSON.parse(localStorage.getItem("jobs-data")).token ;
    console.log(job_id,start,breakson,breaksover,end,details,notes)
const response = await axios.put("http://jobsprovider.herokuapp.com/jobs/updatejob",{
    
    job_id,start,breakson,breaksover,end,details,notes,token 
});
if (response.data.error){
    console.log(response.data.error)
}else{
    console.log("job updated sucessfully")
    document.getElementById("edit-job").classList.add("d-none")
}

})

/** Upload Report */
function uploadReport(id){
    // display edit form for job //
    document.getElementById("upload-documents").classList.remove("d-none");
    // console.log(JSON.parse(job).id)
  document.getElementById("upload-id").value = id ;
}


          
   


