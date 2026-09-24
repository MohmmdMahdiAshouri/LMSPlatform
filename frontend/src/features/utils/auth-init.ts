import { cookies } from 'next/headers';

export async function authInit() {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value
    const refreshRes = await fetch('http://localhost:4000/api/auth/refresh-token', {method: 'POST', headers: {
        cookie: `refreshToken=${refreshToken}`
    }});
    const result = await refreshRes.json()
    console.log(result);
    if(!refreshRes.ok) return null
    

    const getUserRes = await fetch('http://localhost:4000/api/auth/me', {
        headers: {
            authorization: `Bearer ${result.data.accessToken}`
        }
    });

    const userReslut = await getUserRes.json()
    console.log(userReslut);
    
    return userReslut.data
}  