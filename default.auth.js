function basic_auth(){
        return "Basic " + btoa("nickname" + ":" + "you-will-never-guess");
}

var auth = osmAuth({
    oauth_secret: '9WfJnwQxDvvYagx1Ut0tZBsOZ0ZCzAvOje3u1TV0',
    oauth_consumer_key: 'WLwXbm6XFMG7WrVnE8enIF6GzyefYIN6oUJSxG65'
});

