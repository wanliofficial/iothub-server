const verifyQueryMessage = async (ctx, next) => {
    ctx.verifyParams({
        message_id: { type: 'string', required: false },
        device_name: { type: 'string', required: false },
        product_name: { type: 'string', required: false }
    })
    return next()
}

// { type: 'number', required: false }

export { verifyQueryMessage }