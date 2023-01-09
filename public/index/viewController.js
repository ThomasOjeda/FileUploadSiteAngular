angular.module("app", []).controller("myController", function ($scope, $http) {
  var fileInput = document.querySelector('input[type="file"]');

  var refreshFiles = function (callback) {
    if ($scope.selectedOwner != null) {
      $http.get("api/admin/files/owner/" + $scope.selectedOwner,{
        headers: { "Authorization" : "Token "+accessToken },
      }).then(
        function (response) {
          // I should modify this data before displaying it to trim the date field
          $scope.files = response.data;
          callback();
        },
        function errorCallback(response) {
          console.log("Error fetching file list:", response);
          $scope.files = null;
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        }
      );
    } else {
      $scope.files = null;
    }
  };

  var refreshOwners = function (callback) {
    $http.get("api/admin/owners", {
      headers: { "Authorization" : "Token "+accessToken },
    }).then(
      function (response) {
        $scope.owners = response.data;
        callback();
      },
      function errorCallback(response) {
        console.log("Error fetching owner list:", response);
        $scope.owners = null;
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      }
    );
  };

  $scope.pdfSortPropertyName = "name";
  $scope.pdfSortReverse = true;
  $scope.ownerSortPropertyName = "name";
  $scope.ownerSortReverse = true;

  $scope.newFile = null;
  $scope.files = null;
  $scope.fileData = null;

  $scope.newOwner = null;
  $scope.owners = null;
  $scope.selectedOwner = null;
  $scope.selectedOwnerName = "none";
  $scope.selectedOwnerOrganization = "none";

  $scope.loginForm = null;


  accessToken = null;

  $scope.loginClick = function() {
    $http
      .post("api/auth/login", $scope.loginForm)
      .then(
        function (response) {
          accessToken = response.data.token;
          refreshOwners(function () {});
        },
        function errorCallback(response) {
          console.log(response.message);
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        }
      );

  };


  //This call is to laod the owner list at the start.
  refreshOwners(function () {});

  $scope.sortPdfBy = function (propertyName) {
    $scope.pdfSortReverse =
      $scope.pdfSortPropertyName === propertyName
        ? !$scope.pdfSortReverse
        : false;
    $scope.pdfSortPropertyName = propertyName;
  };

  $scope.sortOwnersBy = function (propertyName) {
    $scope.ownerSortReverse =
      $scope.ownerSortPropertyName === propertyName
        ? !$scope.ownerSortReverse
        : false;
    $scope.ownerSortPropertyName = propertyName;
  };

  //Add Product
  //The api does not consider the id that is specified in the newFile object (when an "add file" follows an "edit"), so there is no problem of duplicate mongo ids

  $scope.addFile = function () {
    if ($scope.selectedOwner == null) {
      alert("First Select an Owner. If no owner is available, create one.");
      return;
    }
    var form = new FormData();
    form.append("name", $scope.newFile.name);

    form.append("pages", $scope.newFile.pages);
    form.append("owner", $scope.selectedOwner);
    form.append("data", $scope.newFile.data);

    //This finds the input of the file in the DOM

    //The name of the field "filenameForMulter" must match the one specified in the multer middleware.
    form.append("filenameForMulter", fileInput.files[0]);

    $http
      .post("api/admin/files/upload", form, {
        headers: { "Content-Type": undefined ,  "Authorization" : "Token "+accessToken },
        })
      .then(
        function (response) {
          fileInput.value = null;
          refreshFiles(function () {});
        },
        function errorCallback(response) {
          console.log("Bad ADD:", response);
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        }
      );
  };
  $scope.removeFile = function (id) {
    $http.delete("api/admin/files/upload/" + id,{
      headers: { "Authorization" : "Token "+accessToken },
    }).then(
      function (response) {
        refreshFiles(function () {});
      },
      function errorCallback(response) {
        console.log("Bad DELETE:", response);
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      }
    );
  };
  $scope.editFile = function (id) {
    $http.get("api/admin/files/" + id,{
      headers: { "Authorization" : "Token "+accessToken },
    }).then(
      function (response) {
        fileInput.value = null;
        $scope.newFile = response.data;
      },
      function errorCallback(response) {
        console.log("Bad EDIT:", response);
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      }
    );
  };

  $scope.updateFile = function () {
    $http.put("api/admin/files/" + $scope.newFile._id, $scope.newFile,{
      headers: { "Authorization" : "Token "+accessToken },
    }).then(
      function (response) {
        fileInput.value = null;
        refreshFiles(function () {});
      },
      function errorCallback(response) {
        console.log("Bad UPDATE:", response);
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      }
    );
  };

  $scope.downloadFile = function (id) {
    window.open("/api/admin/files/download/" + id, "_blank"); //Tells the browser to open a new window and navigate to the download url
  };

  $scope.downloadFile2 = function (id) {
    $http.get("api/admin/files/download/" + id,{responseType:'arraybuffer',
      headers: { "Authorization" : "Token "+accessToken },
    }).then(
      function (response) {
        var fileBlob = new Blob([response.data], {type: 'application/pdf'});
        var fileURL = URL.createObjectURL(fileBlob);
        const anchor = document.createElement("a");
        anchor.href = fileURL;
        anchor.download = "download.pdf";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(fileURL)


      },
      function errorCallback(response) {

      }
    );
  };

  //It looks like if the scope variable is updated, its corresponding html view is also updated
  $scope.cleanFileField = function () {
    fileInput.value = null;
    $scope.newFile = {};
  };

  $scope.addOwner = function () {
    $http.post("api/auth/signup", $scope.newOwner,{
      headers: { "Authorization" : "Token "+accessToken },
    }).then(
      function (response) {
        refreshOwners(function () {});
      },
      function errorCallback(response) {
        console.log("Bad ADD:", response);
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      }
    );
  };
  //Remove
  $scope.removeOwner = function (id) {
    $http.delete("api/admin/owners/" + id,{
      headers: { "Authorization" : "Token "+accessToken },
    }).then(
      function (response) {
        refreshOwners(function () {
          if ($scope.selectedOwner == id) {
            $scope.selectedOwner = null;
            $scope.selectedOwnerName = "none";
            $scope.selectedOwnerOrganization = "none";
            refreshFiles(function () {});
          }
        });
      },
      function errorCallback(response) {
        console.log("Bad DELETE:", response);
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      }
    );
  };
  $scope.editOwner = function (id) {
    $http.get("api/admin/owners/" + id,{
      headers: { "Authorization" : "Token "+accessToken },
    }).then(
      function (response) {
        $scope.newOwner = response.data;
      },
      function errorCallback(response) {
        console.log("Bad EDIT:", response);
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      }
    );
  };

  $scope.updateOwner = function () {

    $http.put("api/admin/owners/" + $scope.newOwner._id, $scope.newOwner,{
      headers: { "Authorization" : "Token "+accessToken },
    }).then(
      function (response) {
        refreshOwners(function () {});
      },
      function errorCallback(response) {
        console.log("Bad UPDATE:", response);
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      }
    );
  };

  $scope.selectOwner = function (id, name, organization) {
    $scope.selectedOwner = id;
    $scope.selectedOwnerName = name;
    $scope.selectedOwnerOrganization = organization;
    refreshFiles(function () {});
  };

  //It looks like if the scope variable is updated, its corresponding html view is also updated
  $scope.cleanOwnerField = function () {
    $scope.newOwner = {};
  };

  $scope.unsetOwner = function () {
    $scope.selectedOwner = null;
    $scope.selectedOwnerName = "none";
    $scope.selectedOwnerOrganization = "none";
    refreshFiles(function () {});
  };
});
