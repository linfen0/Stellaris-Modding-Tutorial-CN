type blogAuthorSchema = {
    name: string;
    title?: string | undefined;
    picture?: string | undefined;
    url?: string | undefined;
};

const authors: Record<string, blogAuthorSchema> = {
    "embers-of-the-fire": {
        name: "Embers of the Fire",
        title: "站长",
        picture: "/authors/Embers-of-the-Fire.jpg",
    },
    "_OAO_": {
        name: "_OAO_",
        title: "Modder",
        picture: "/authors/_OAO_.jpg",
    }
};

export default authors;
