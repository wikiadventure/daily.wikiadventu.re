import { copyToClipboard, Notify } from 'quasar';
export function CopyToClipboard(toCopy:string, onSuccessMessage:string, onFailMessage:string) {

    copyToClipboard(toCopy)
    .then(() => {
        Notify.create({
            type: 'annonce',
            timeout: 1000,
            position: 'bottom-right',
            message: onSuccessMessage
        });
    })
    .catch(() => {
        Notify.create({
            type: 'error',
            timeout: 1000,
            position: 'bottom-right',
            message: onFailMessage
        });
    })

}
