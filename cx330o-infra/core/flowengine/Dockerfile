FROM docker.n8n.io/n8nio/n8n:latest

USER root

# 去掉密码所有限制（大写字母、最小长度）
RUN PWFILE=$(find / -name 'password.schema.js' -path '*api-types*' 2>/dev/null | head -1) && \
    if [ -n "$PWFILE" ]; then \
      sed -i "s|\.refine((password) => /\[A-Z\]/\.test(password), {|.refine((password) => true, {|" "$PWFILE" && \
      sed -i 's|const minLength = 8|const minLength = 1|g' "$PWFILE" && \
      echo "Patched password rules in $PWFILE"; \
    fi

USER node
