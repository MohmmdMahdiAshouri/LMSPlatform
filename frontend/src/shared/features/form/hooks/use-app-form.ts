import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from './use-form-context';
import { TextField } from '../components/TextField';
import { TextareaField } from '../components/TextareaField';
import { SelectField } from '../components/SelectField';
import { CheckboxField } from '../components/CheckboxField';
import { SwitchField } from '../components/SwithField';
import { SubmitButton } from '../components/SubmitButton';

export const { useAppForm, withForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        TextField,
        TextareaField,
        SelectField,
        CheckboxField,
        SwitchField,
    },
    formComponents: {
        SubmitButton,
    },
});
