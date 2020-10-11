const verifyAddUser = async (ctx, next) => {
    ctx.verifyParams({
        openid: { type: 'string', required: true },
        session_key: { type: 'string', required: true },
        nickName: { type: 'string', required: true },
        avatarUrl: { type: 'string', required: true },
        gender: { type: 'number', required: true },
        country: { type: 'string', required: true },
        province: { type: 'string', required: true },
        city: { type: 'string', required: true },
        language: { type: 'string', required: true }
    })
    return next()
}

const verifyGetOpenid = async (ctx, next) => {
    ctx.verifyParams({
        code: { type: 'string', required: true }
    })
    return next()
}

export { verifyAddUser, verifyGetOpenid }