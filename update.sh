install(){
  apt install clang -y
  clang update.c
}

run(){
  ./a.out
 }

install
run
