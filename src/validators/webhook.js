const verifyAddDevice = async (ctx, next) => {
    ctx.verifyParams({
        product_name: { type: 'string', required: true }
    })
    return next()
}

export { verifyAddDevice }