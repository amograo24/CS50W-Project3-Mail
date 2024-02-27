document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  const dict_email_card = {true:"#f2f2f2",false:"white"}
  fetch(`/emails/${mailbox}`)
  .then (response => response.json())
  .then (emails => {
    emails.forEach(element => {
      if (mailbox==="sent") {
        to_from=element.recipients
      } else {
        to_from=element.sender
      }
      const email_card = document.createElement('div');
      email_card.className = "email_card"
      email_card.innerHTML=`<div style="background-color: ${dict_email_card[element.read]};"><span><strong>${to_from}</strong></span><span id="center_in_span">${element.subject}</span><span id="right_in_span" style="color: #b3b3b3;">${element.timestamp}</span></div>`;
      document.querySelector('#emails-view').appendChild(email_card);
      console.log(email_card)
      email_card.addEventListener('click',() => {
        EmailRead(element.id);
        emailDisplay(element.id,mailbox)
      })
    });
  });
}

function emailDisplay(id,mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    let email_display = document.createElement('div');
    email_display.className="email";
    email_display.innerHTML=`<div>
    <div><strong>From:</strong> ${email.sender}</div>
    <div><strong>To:</strong> ${email.recipients}</div>
    <div><strong>Subject:</strong> ${email.subject}</div>
    <div><strong>Timestamp:</strong> ${email.timestamp}</div>
    <div id="buttons-view" ></div>
    <hr/>
    <div>${email.body}</div>
    </div>`
    document.querySelector('#email-view').innerHTML=email_display.innerHTML;
    let reply = document.createElement('button');
    reply.innerHTML="Reply"
    reply.className="btn btn-sm btn-outline-primary";
    reply.addEventListener('click', () => {
      replyEmail(email);
    })
    document.querySelector('#buttons-view').append(reply);
    if (mailbox==="sent") {
      return;
    } else {
      let archive = document.createElement('button');
      archive.className="btn btn-sm btn-outline-primary";
      if (email.archived===true) {
        archive.innerHTML="Unarchive";
      } else {
        archive.innerHTML="Archive";
      }
      archive.addEventListener('click', () => {
        SwitchArchiveStatus(id,email.archived);
        if (archive.innerHTML==="Archive") {
          archive.innerHTML="Unarchive";
        } else {
          archive.innerHTML="Archive";
        }
        load_mailbox("inbox")
        location.reload();
      });
      document.querySelector('#buttons-view').append(archive)
    }
  });
}

function EmailRead(id) {
  fetch(`/emails/${id}`,{
    method: "PUT",
    body: JSON.stringify({
      read:true
    })
  })
}

function SwitchArchiveStatus(id, state) {
  fetch(`/emails/${id}`,{
    method: "PUT",
    body: JSON.stringify({
      archived: !state
    })
  });
}

function replyEmail(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-recipients').disabled = true;
  if (email.subject.startsWith("RE:") || email.subject.startsWith("re:") || email.subject.startsWith("Re:") || email.subject.startsWith("rE:")) {
    document.querySelector('#compose-subject').value = email.subject;
  }
  else {
    document.querySelector('#compose-subject').value = "RE: "+email.subject;
  }  
  document.querySelector('#compose-subject').disabled = true;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: \n${email.body} \n\n`;
  
}
document.addEventListener("DOMContentLoaded", send_mail)
function send_mail() {
  const compose = document.querySelector('#compose-form');
  const error = document.querySelector('#error');
  compose.addEventListener('submit', event => {
    event.preventDefault();
    const recipients=document.querySelector('#compose-recipients').value;
    const subject=document.querySelector('#compose-subject').value;
    const body=document.querySelector('#compose-body').value;
    fetch('/emails', {
      method:"POST",
      body: JSON.stringify({
        recipients:recipients,
        subject:subject,
        body:body
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      if (true) {
        load_mailbox("sent")
        console.log("success");
      } else {
        error.fontSize='40px';
      }
    })
  })
}