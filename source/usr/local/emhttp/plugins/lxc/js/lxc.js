//Don't execute commands again if page is refreshed
if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
}

function postAction(name, id) {
  let postData = {
    'lxc'   : '',
    'action'     : name,
    'container': id
  };
  $.post("/plugins/lxc/include/ajax.php", postData).done(function(response){
    parent.window.location.reload();
  });
}

function startConsole(name) {
  openTerminal('lxc',name);
}

// Function to wait for an element to be available
function waitForElement(elementPath, callBack){
  window.setTimeout(function(){
    if($(elementPath).length){
      callBack(elementPath, $(elementPath));
    }else{
      waitForElement(elementPath, callBack);
    }
  },500)
}

// Function that shows the dialog
function showDialog(callback, text) {
  swal({
      title:"Proceed?",
      text: text,
      type:'warning',
      html:true,
      showCancelButton:true,
      confirmButtonText: "Proceed",
      cancelButtonText:"Cancel"},
    function(confirm){
      callback(confirm);
    });
}

// Function that shows the status dialog
function showStatus(action, id, title, text, wait = 0) {
  let statusInterval;

  swal({
    title:title,
    text:"<pre id='swaltext'></pre><hr>",
    html:true,
    animation:'none',
    customClass: 'nchan',
    showConfirmButton:true,
    confirmButtonText: "Done",
    function (c) {
      if (c) {
        location.reload();
      }
    }
  })

  $('button.confirm').prop('disabled',true);
  $('.la-ball-fall').hide();

  waitForElement("#swaltext", function () {
    let dialogContent = $("#swaltext");
    $.ajax({
      type: "POST",
      url: '/plugins/lxc/include/ajax.php',
      data: {
        'lxc': '',
        'action': action,
        'container': id
      },
      beforeSend: function () {
        dialogContent.append(text);
        statusInterval = setInterval(function () {
          dialogContent.append("<p>......</p>");
        }, 5000);
      },
      success: function (data) {
        dialogContent.append("<p>Done " + text + "</p>");
        $('button.confirm').prop('disabled',false);
        clearInterval(statusInterval);
      }
    });
  });
}


function showDropdown(contName) {
  document.getElementById("dropdown_" + contName).classList.toggle("show");
}

// Function that creates a new container
function createContainer(name, distribution, release, autostart, mac) {
  let statusInterval;

  swal({
    title:'Create Container',
    text:"<pre id='swaltext'></pre><hr>",
    html:true,
    animation:'none',
    customClass: 'nchan',
    showConfirmButton:true,
    confirmButtonText: "Done",
    function (p) {
      if (p) {
        location.reload();
      }
    }
  })

  $('button.confirm').prop('disabled',true);
  $('.la-ball-fall').hide();

  waitForElement("#swaltext", function () {
    let dialogContent = $("#swaltext");
    $.ajax({
      type: "POST",
      url: '/plugins/lxc/include/ajax.php',
      data: {
        'lxc': '',
        'action': 'createCONT',
        'name': name,
        'distribution': distribution,
        'release': release,
        'autostart': autostart,
        'mac': mac
      },
      xhr: function() {
        // get the native XmlHttpRequest object
        const xhr = $.ajaxSettings.xhr();
        // set the onprogress event handler
        xhr.onprogress = function() {
          // replace the '#output' element inner HTML with the received part of the response
          dialogContent.html("<p>Creating container, please wait until the DONE button is displayed!</p><p>" + xhr.responseText + "</p>");
        }
        return xhr;
      },
      beforeSend: function () {
        dialogContent.append("Creating container, please wait until the DONE button is displayed!");
        statusInterval = setInterval(function () {
          dialogContent.append("<p>......</p>");
        }, 5000);
      },
      success: function (data) {
        dialogContent.append("<p>To connect to the container, start the container first, open up a Unraid terminal and type in:</p>");
        dialogContent.append("<p>lxc-attach " + name + "</p>")
        dialogContent.append('<p>It is recommended to attach to the corresponding shell by typing in for example:</p>');
        dialogContent.append("<p>lxc-attach " + name + " /bin/bash</p>");
        clearInterval(statusInterval);
        $('button.confirm').prop('disabled',false);
      }
    });
  });
}

// Function that copies a container
function createCopy(name, autostart, mac) {
  let statusInterval;

  swal({
    title:'Copy Container',
    text:"<pre id='swaltext'></pre><hr>",
    html:true,
    animation:'none',
    customClass: 'nchan',
    showConfirmButton:true,
    confirmButtonText: "Done",
    function (p) {
      if (p) {
        location.reload();
      }
    }
  })

  $('button.confirm').prop('disabled',true);
  $('.la-ball-fall').hide();

  waitForElement("#swaltext", function () {
    let dialogContent = $("#swaltext");
    $.ajax({
      type: "POST",
      url: '/plugins/lxc/include/ajax.php',
      data: {
        'lxc': '',
        'action': 'copyCONT',
        'container': container,
        'name': name,
        'autostart': autostart,
        'mac': mac
      },
      xhr: function() {
        // get the native XmlHttpRequest object
        const xhr = $.ajaxSettings.xhr();
        // set the onprogress event handler
        xhr.onprogress = function() {
          // replace the '#output' element inner HTML with the received part of the response
          dialogContent.html("<p>Copying container, please wait until the DONE button is displayed!</p><p>" + xhr.responseText + "</p>");
        }
        return xhr;
      },
      beforeSend: function () {
        dialogContent.append("Copying container, please wait until the DONE button is displayed!");
        statusInterval = setInterval(function () {
          dialogContent.append("<p>......</p>");
        }, 5000);
      },
      success: function (data) {
        dialogContent.append("<p>To connect to the container, start the container first, open up a Unraid terminal and type in:</p>");
        dialogContent.append("<p>lxc-attach " + name + "</p>")
        dialogContent.append('<p>It is recommended to attach to the corresponding shell by typing in for example:</p>');
        dialogContent.append("<p>lxc-attach " + name + " /bin/bash</p>");
        $('button.confirm').prop('disabled',false);
        clearInterval(statusInterval);
      }
    });
  });
}

$(function() {
  // Disables all spaces in input fields
  $('input[type="text"]').on({
    keydown: function (e) {
      if (e.which === 32)
        return false;
    }
  });

  // Listener for deleting snapshots
  $(".deleteSNAP").on("click", function() {
    let id = this.id.split(" ")[0];
    let snapshot = this.id.split(" ")[1];

    swal({
        title: "Proceed?",
        text: "ATTENTION: Do you really want to destroy this Snapshot? This is IRREVERSIBLE and will delete the snapshot and all data in it!",
        type: 'warning',
        html: true,
        showCancelButton: true,
        confirmButtonText: "Proceed",
        cancelButtonText: "Cancel"
      },
      function (p) {
        if (p) {
          let postData = {
            'lxc'   : '',
            'action'     : 'deleteSNAP',
            'container': id,
            'snapshot': snapshot
          };
          $.post("/plugins/lxc/include/ajax.php", postData).done(function(){
            parent.window.location.reload();
          });
        }
      });
  });

  // Listener for restoring from snapshot form
  $(document).on("submit", "form#fromSnapshot", function (event) {
    event.preventDefault();
    let statusInterval;
    let name = this.contName.value;
    let autostart = this.contAutostart.checked;
    let mac = this.contMac.value;
    swal({
      title:"Restoring Container",
      text:"<pre id='swaltext'></pre><hr>",
      html:true,
      animation:'none',
      customClass: 'nchan',
      showConfirmButton:true,
      confirmButtonText: "Done",
      function (p) {
        if (p) {
          location.reload();
        }
      }
    })

    $('button.confirm').prop('disabled',true);
    $('.la-ball-fall').hide();

    waitForElement("#swaltext", function () {
      let dialogContent = $("#swaltext");
      $.ajax({
        type: "POST",
        url: '/plugins/lxc/include/ajax.php',
        data: {
          'lxc': '',
          'action': 'fromSnapshot',
          'name': name,
          'container': container,
          'snapshot': snapshot,
          'autostart': autostart,
          'mac': mac
        },
        xhr: function() {
          // get the native XmlHttpRequest object
          const xhr = $.ajaxSettings.xhr();
          // set the onprogress event handler
          xhr.onprogress = function() {
            // replace the '#output' element inner HTML with the received part of the response
            dialogContent.html("<p>Creating container, please wait until the DONE button is displayed!</p><p>" + xhr.responseText + "</p>");
          }
          return xhr;
        },
        beforeSend: function () {
          dialogContent.append("Creating container, please wait until the DONE button is displayed!");
          statusInterval = setInterval(function () {
            dialogContent.append("<p>......</p>");
          }, 5000);
        },
        success: function (data) {
          dialogContent.append("<p>To connect to the container, start the container first, open up a Unraid terminal and type in:</p>");
          dialogContent.append("<p>lxc-attach " + name + "</p>")
          dialogContent.append('<p>It is recommended to attach to the corresponding shell by typing in for example:</p>');
          dialogContent.append("<p>lxc-attach " + name + " /bin/bash</p>");
          $('button.confirm').prop('disabled',false);
          clearInterval(statusInterval);
        }
      });
    });
  });

  // Listener for add container form
  $(document).on('submit','form#addContainer',function(event){
    event.preventDefault();
    let regex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
    if (!regex.test(this.contMac.value)) {
      this.contMac.classList.add("err");
      $("#emac").css('visibility', 'visible')
      return false;
    }
    let distribution = this.contDistribution.value;
    let release = this.contRelease.value;
    let name = this.contName.value;
    let autostart = this.contAutostart.checked;
    let mac = this.contMac.value;

    createContainer(name, distribution, release, autostart, mac);
  });

  // Listener for create VNC container form
  $(document).on('submit','form#createVNC',function(event){
    event.preventDefault();
    let name = form.VNCcontName.value;
    createContainer(name, distribution, release, autostart, mac);
  });

  // Listener for copying container
  $(document).on('submit','form#copyCont',function(event){
    event.preventDefault();
    let regex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
    if (!regex.test(this.contMac.value)) {
      this.contMac.classList.add("err");
      $("#emac").css('visibility', 'visible')
      return false;
    }
    let name = this.contName.value;
    let autostart = this.contAutostart.checked;
    let mac = this.contMac.value;
    createCopy(name, autostart, mac);
  });

  // Listener for all button actions
  $(".stopCONT, .freezeCONT, .killCONT, .unfreezeCONT, .startCONT, .disableAUTOSTART").on("click", function(e) {
    e.stopImmediatePropagation();
    postAction($(this).attr("class"), this.id);
  });

  // Listener to show container config
  document.addEventListener('click', function(e){
    if(e.target.id=="dist"){
      e.stopImmediatePropagation();
      let statusInterval;
      let container = $(e.target).attr("class");
      swal({
        title:"Configuration",
        text:"<pre id='swaltext'></pre><hr>",
        html:true,
        animation:'none',
        customClass: 'nchan',
        showConfirmButton:true,
        confirmButtonText: "Done",
        function (p) {
          if (p) {
            location.reload();
          }
        }
      })

      $('button.confirm').prop('disabled',true);
      $('.la-ball-fall').hide();

      waitForElement("#swaltext", function () {
        let dialogContent = $("#swaltext");
        $.ajax({
          type: "POST",
          url: '/plugins/lxc/include/ajax.php',
          data: {
            'lxc': '',
            'action': "showConfig",
            'container': container
          },
          success: function (data) {
            dialogContent.append(data);
            $('button.confirm').prop('disabled',false);
            clearInterval(statusInterval);
          }
        });
      });
    } else if ($(e.target).attr("class")=="btn_dropdown") {
      var dropdowns = document.getElementsByClassName("dropdown-menu");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  });

  let checkboxes = $("input[type=checkbox]")
  checkboxes.change(function(e) {
    e.stopImmediatePropagation();
    let postData = {
      'lxc'   : '',
      'action'     : "autostart",
      'container': this.id,
      'autostart': $(this).is(':checked')
    };
    $.post("/plugins/lxc/include/ajax.php", postData).done(function(response){});
  });

  $(document).mouseup(function (e) {
    if ($(e.target).closest(".btn_dropdown").length === 0) {
      $('.dropdown-menu').removeClass('show');
    }
  });

  // Listener to destroy container
  $(".destroyCONT").on("click", function() {
    let id = this.id;
    let statusInterval;

    swal({
        title: "Proceed?",
        text: "ATTENTION: Do you really want to destroy this LXC Container? This is IRREVERSIBLE and will delete the container, snapshots and all data in it!",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Proceed",
        cancelButtonText: "Cancel"
      },
      function(isConfirm){
        if (isConfirm) {
          swal({
            title:"Configuration",
            text:"<pre id='swaltext'></pre><hr>",
            html:true,
            animation:'none',
            customClass: 'nchan',
            showConfirmButton:true,
            confirmButtonText: "Done",
          }, function (isConfirm) {
            if (isConfirm) {
              location.reload();
            }
          });

          $('button.confirm').prop('disabled',true);
          $('.la-ball-fall').hide();

          waitForElement("#swaltext", function () {
            let dialogContent = $("#swaltext");
            $.ajax({
              type: "POST",
              url: '/plugins/lxc/include/ajax.php',
              data: {
                'lxc': '',
                'action': 'destroyCONT',
                'container': id
              },
              beforeSend: function () {
                dialogContent.append("Destroying container, please wait until the DONE button is displayed!");
                statusInterval = setInterval(function () {
                  dialogContent.append("<p>......</p>");
                }, 5000);
              },
              success: function (data) {
                dialogContent.append("Container destroyed");
                $('button.confirm').prop('disabled',false);
                clearInterval(statusInterval);
              }
            });
          });
        }
      });
  });

  // Listener to snapshot container
  $(".snapshotCONT").on("click", function() {
    let id = this.id;
    let statusInterval;

    swal({
          title: "Proceed?",
          text: "This action will stop the LXC Container and start it again if it was running.",
          type: "warning",
          showCancelButton: true,
          confirmButtonText: "Proceed",
          cancelButtonText: "Cancel"
        },
        function(isConfirm){
          if (isConfirm) {
            swal({
              title:"Snapshot Container",
              text:"<pre id='swaltext'></pre><hr>",
              html:true,
              animation:'none',
              customClass: 'nchan',
              showConfirmButton:true,
              confirmButtonText: "Done",
            }, function (isConfirm) {
              if (isConfirm) {
                location.reload();
              }
            });

            $('button.confirm').prop('disabled',true);
            $('.la-ball-fall').hide();

            waitForElement("#swaltext", function () {
              let dialogContent = $("#swaltext");
              $.ajax({
                type: "POST",
                url: '/plugins/lxc/include/ajax.php',
                data: {
                  'lxc': '',
                  'action': 'snapshotCONT',
                  'container': id
                },
                beforeSend: function () {
                  dialogContent.append("Snapshotting Container " + id);
                  statusInterval = setInterval(function () {
                    dialogContent.append("<p>......</p>");
                  }, 5000);
                },
                success: function (data) {
                  dialogContent.append("Snapshot Created");
                  $('button.confirm').prop('disabled',false);
                  clearInterval(statusInterval);
                }
              });
            });
          }
        });
  });
})

$('.autostart').switchButton({labels_placement:'right', on_label:"On", off_label:"Off"});
