const deleteToken = (token) => {
    console.log("cevaaaaaaaaa")
    const actionConfirm = confirm("Are you sure you want to delete this Token?");
    if(actionConfirm) {
        location.href = '/admin/tokens/delete?token=' + encodeURIComponent(token);
    }
}
