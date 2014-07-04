function basic_auth(){
        return "Basic " + btoa("nickname" + ":" + "you-will-never-guess");
}