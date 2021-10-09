export function objectForEach<TObj>(
    obj: TObj,
    fn: (key: keyof TObj, val: TObj[keyof TObj]) => void,
) {
    const keys = Object.keys(obj) as (keyof TObj)[];

    keys.forEach(key => {
        fn(key, obj[key]);
    });
}