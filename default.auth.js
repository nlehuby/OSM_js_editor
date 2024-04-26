function basic_auth() {
    return "Basic " + btoa("nickname" + ":" + "you-will-never-guess");
}

var auth = osmAuth.osmAuth({
    client_id: 'to-be-changed',
    redirect_uri: window.location.origin + window.location.pathname + "land.html",
    scope: "read_prefs write_api",
    singlepage: false,
    url: 'https://www.openstreetmap.org'
});
