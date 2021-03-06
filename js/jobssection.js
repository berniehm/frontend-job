






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

document.querySelector('#edit-job-form').addEventListener('edit', async (e) => {
    e.preventDefault();
    const start = document.querySelector('#start').value;
    const end = document.querySelector('#end').value;
    const details = document.querySelector('#details').value;
    const notes = document.querySelector('#notes').value;

    console.log("works");

    // Validate
    if(start === '' || end === '' || details === ''){
        UI.showNotification('All fields are required!', 'danger');
    }else{
       const response = await axios.post("http://localhost:8080/jobs/updatejob?token="+JSON.parse(localStorage.getItem("jobs-data")).token,
       {start, end, details, notes}) ;
       if(response.data.error){
           console.log(response.data.error)
       }else{
        console.log("job updated");
        UI.showNotification('Your Job is Successfully updated !', 'success');
        UI.clearFileds();

        displayJobs(JSON.parse(localStorage.getItem("jobs-data")).token);
       }
    }
});


async function deleteJob(id){
    const response = await axios.delete("http://localhost:8080/jobs/"+id);

    if(response.data.error){
        console.log("unable to delete job")
    }else{
        console.log("deleted job")
    }

    displayJobs(JSON.parse(localStorage.getItem("jobs-data")).token);
}

async function displayJobs(token){
    const res = await axios.post("http://localhost:8080/user/jobs?token="+token) ;
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
                <td>${job.end}</td>
                <td>${time_diff(job.start,job.end)}</td>
                <td>${job.details}</td>
                <td>${job.notes}</td>
                <td><a href = "http://localhost:8080/jobs/getdocument/${job._id.toString()}">${doc}</a></td>
                <td><button onclick="deleteJob('${job._id.toString()}')">Delete</button></td>
                <td><a class="nav-link" href="./jobssection.html">edit</a></td>
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





