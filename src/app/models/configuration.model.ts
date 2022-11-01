export interface IExercise {
    name: string;
    url: string;
}

export interface ICategory {
    name: string;
    children: IExercise[];
}


export interface IPage {
    id: string;
    name: string;
}